'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { HiShieldExclamation, HiLockOpen, HiLockClosed, HiArrowPath } from 'react-icons/hi2';
import { HiUsers, HiEye, HiRefresh } from 'react-icons/hi';
import { FaUserSecret } from 'react-icons/fa';

type BlockItem = {
  id: number;
  ip_address: string | null;
  user_id: number | null;
  username: string | null;
  fullname: string | null;
  blocked_until: string | null;
  reason: string | null;
  created_at: string | null;
};

type AttemptItem = {
  id: number;
  ip_address: string | null;
  user_id: number | null;
  username: string | null;
  fullname: string | null;
  user_agent: string | null;
  created_at: string | null;
};

type AttemptGroup = {
  key: string;
  items: AttemptItem[];
  representative: AttemptItem;
};

type BlockGroup = {
  key: string;
  items: BlockItem[];
  representative: BlockItem;
};

function fmtDate(dateIso: string | null | undefined) {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function normalize(text: string | null | undefined) {
  return (text ?? '').toString().trim().toLowerCase();
}

export default function SecurityLoginPage() {
  const router = useRouter();

  const [blockedItems, setBlockedItems] = useState<BlockItem[]>([]);
  const [attemptItems, setAttemptItems] = useState<AttemptItem[]>([]);

  const [loadingBlocked, setLoadingBlocked] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // IMPORTANT: Tabs jangan diubah
  const [activeTab, setActiveTab] = useState<'attempts' | 'blocks'>('attempts');

  const [query, setQuery] = useState('');

  const canAccess = (id: number | undefined) => id === 1 || id === 4;

  useEffect(() => {
    checkAdminAccess();
    fetchBlocked();
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/session');
      const data = await response.json();
      if (!data.user || !canAccess(data.user.id)) {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Anda tidak memiliki akses ke halaman ini',
          confirmButtonColor: '#003a69',
        }).then(() => router.push('/dashboard'));
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const fetchBlocked = async () => {
    setLoadingBlocked(true);
    try {
      const response = await fetch('/api/admin/get-blocked-login-security');
      const data = await response.json();
      if (data.status === 'success') {
        setBlockedItems(Array.isArray(data.data) ? data.data : []);
      } else {
        setBlockedItems([]);
      }
    } catch (error) {
      console.error('Error fetching blocked items:', error);
      setBlockedItems([]);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const fetchAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const response = await fetch('/api/admin/get-login-attempts?limit=50');
      const data = await response.json();
      if (data.status === 'success') {
        setAttemptItems(Array.isArray(data.data) ? data.data : []);
      } else {
        setAttemptItems([]);
      }
    } catch (error) {
      console.error('Error fetching attempt items:', error);
      setAttemptItems([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchBlocked(), fetchAttempts()]);
  };

  const whoForBlock = (item: BlockItem) =>
    item.user_id
      ? item.fullname || item.username || `User ${item.user_id}`
      : `IP ${item.ip_address ?? '-'}`;

  const whoForAttempt = (item: AttemptItem) =>
    item.user_id
      ? item.fullname || item.username || `User ${item.user_id}`
      : `IP ${item.ip_address ?? '-'}`;

  const blockedUntilText = (item: BlockItem) =>
    item.blocked_until ? fmtDate(item.blocked_until) : 'Permanent';

  const attemptKey = (item: AttemptItem) => {
    const ip = item.ip_address ?? '';
    const user = (item.username ?? item.fullname ?? '').toString();
    return `ip:${ip}|user:${normalize(user)}`;
  };

  const blockKey = (item: BlockItem) => {
    const ip = item.ip_address ?? '';
    const user = (item.username ?? item.fullname ?? '').toString();
    return `ip:${ip}|user:${normalize(user)}`;
  };

  const attemptMatchesQuery = (item: AttemptItem, q: string) => {
    if (!q) return true;
    const qq = q.toLowerCase();
    return (
      normalize(item.ip_address).includes(qq) ||
      normalize(item.fullname).includes(qq) ||
      normalize(item.username).includes(qq) ||
      normalize(item.user_agent).includes(qq)
    );
  };

  const blockMatchesQuery = (item: BlockItem, q: string) => {
    if (!q) return true;
    const qq = q.toLowerCase();
    return (
      normalize(item.ip_address).includes(qq) ||
      normalize(item.fullname).includes(qq) ||
      normalize(item.username).includes(qq) ||
      normalize(item.reason).includes(qq)
    );
  };

  const groupedAttempts = useMemo(() => {
    const q = query.trim();
    const filtered = attemptItems.filter((it) => attemptMatchesQuery(it, q));

    const map = new Map<string, AttemptGroup>();
    for (const item of filtered) {
      const key = attemptKey(item);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { key, items: [item], representative: item });
      } else {
        existing.items.push(item);
      }
    }

    return Array.from(map.values());
  }, [attemptItems, query]);

  const groupedBlocks = useMemo(() => {
    const q = query.trim();
    const filtered = blockedItems.filter((it) => blockMatchesQuery(it, q));

    const map = new Map<string, BlockGroup>();
    for (const item of filtered) {
      const key = blockKey(item);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { key, items: [item], representative: item });
      } else {
        existing.items.push(item);
      }
    }

    return Array.from(map.values());
  }, [blockedItems, query]);

  const restoreBlockItem = async (item: BlockItem) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Restore SL Block?',
      text: whoForBlock(item),
      showCancelButton: true,
      confirmButtonColor: '#003a69',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Restore',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/admin/restore-login-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: item.ip_address ?? undefined,
          user_id: item.user_id ?? undefined,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: data.message || 'Block berhasil di-restore',
          confirmButtonColor: '#003a69',
          timer: 2000,
        });
        fetchBlocked();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.message || 'Gagal restore block',
          confirmButtonColor: '#003a69',
        });
      }
    } catch (error) {
      console.error('restoreBlockItem error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat restore block',
        confirmButtonColor: '#003a69',
      });
    }
  };

  const restoreAttemptItem = async (item: AttemptItem) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Restore SL Attempt?',
      text: whoForAttempt(item),
      showCancelButton: true,
      confirmButtonColor: '#003a69',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Restore',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/admin/restore-login-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: item.ip_address ?? undefined,
          user_id: item.user_id ?? undefined,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: data.message || 'Attempts berhasil di-restore',
          confirmButtonColor: '#003a69',
          timer: 2000,
        });
        fetchAttempts();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.message || 'Gagal restore attempts',
          confirmButtonColor: '#003a69',
        });
      }
    } catch (error) {
      console.error('restoreAttemptItem error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat restore attempts',
        confirmButtonColor: '#003a69',
      });
    }
  };

  const restoreAllBlocks = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Restore Semua SL Blocks?',
      text: 'Ini akan menghapus semua daftar IP/User yang diblokir (blocks) (tidak menyentuh attempts).',
      showCancelButton: true,
      confirmButtonColor: '#003a69',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Restore Semua',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/admin/restore-login-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: data.message || 'Blocks berhasil di-restore',
          confirmButtonColor: '#003a69',
          timer: 2000,
        });
        fetchBlocked();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.message || 'Gagal restore blocks',
          confirmButtonColor: '#003a69',
        });
      }
    } catch (error) {
      console.error('restoreAllBlocks error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat restore blocks',
        confirmButtonColor: '#003a69',
      });
    }
  };

  const restoreAllAttempts = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Restore Semua SL Attempts?',
      text: 'Ini akan menghapus semua log attempts gagal (tidak menyentuh blocks).',
      showCancelButton: true,
      confirmButtonColor: '#003a69',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Restore Semua',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/admin/restore-login-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: data.message || 'Attempts berhasil di-restore',
          confirmButtonColor: '#003a69',
          timer: 2000,
        });
        fetchAttempts();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.message || 'Gagal restore attempts',
          confirmButtonColor: '#003a69',
        });
      }
    } catch (error) {
      console.error('restoreAllAttempts error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat restore attempts',
        confirmButtonColor: '#003a69',
      });
    }
  };

  return (
    <div className="space-y-6 pb-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[#005a9c] flex items-center justify-center shadow-lg shadow-primary/20">
              <HiShieldExclamation className="w-6 h-6 text-white" />
            </div>
            Security Login
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-14">
            SL Attempts & SL Blocks untuk mencegah brute-force
          </p>
        </div>
      </div>

      {/* Tabs (JANGAN diubah strukturnya) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('attempts')}
            className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${
              activeTab === 'attempts'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            SL Attempts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blocks')}
            className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${
              activeTab === 'blocks'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            SL Blocks
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {activeTab === 'attempts' ? `${attemptItems.length} item` : `${blockedItems.length} item`}
        </div>
      </div>

      {/* Controls: Search + Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[360px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === 'attempts'
                ? 'Searching: IP / username / fullname / user-agent...'
                : 'Searching: IP / username / fullname / reason...'
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-bold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={refreshAll}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <HiRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {activeTab === 'attempts' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <FaUserSecret className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="min-w-0">
                <p className="text-gray-900 dark:text-white font-extrabold text-lg truncate">SL Attempts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {loadingAttempts
                    ? 'Memuat...'
                    : `${groupedAttempts.length} group${query.trim() ? ' (filtered)' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreAllAttempts}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <HiRefresh className="w-4 h-4" />
                Restore All
              </button>
            </div>
          </div>

          <div className="p-5">
            {loadingAttempts ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Memuat data...</div>
            ) : groupedAttempts.length === 0 ? (
              <div className="text-center py-10">
                <HiEye className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-semibold">Tidak ada SL Attempts</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {query.trim() ? 'Tidak ada data yang cocok dengan filter.' : 'Gunakan brute-force untuk melihat data log.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedAttempts.map((group) => {
                  const rep = group.representative;
                  const who = whoForAttempt(rep);

                  const atList = group.items
                    .map((x) => (x.created_at ? fmtDate(x.created_at) : null))
                    .filter(Boolean) as string[];

                  const uaList = Array.from(
                    new Set(group.items.map((x) => (x.user_agent ? x.user_agent.trim() : '')).filter(Boolean))
                  );

                  return (
                    <div
                      key={group.key}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{who}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="truncate">
                            Count: <span className="font-semibold">{group.items.length}</span>
                          </span>
                          {atList.length > 0 && (
                            <span className="truncate">
                              At: <span className="font-semibold">{atList[0]}</span>
                              {atList.length > 1 && <span className="text-gray-400"> (+{atList.length - 1})</span>}
                            </span>
                          )}
                          {uaList.length > 0 && (
                            <span className="truncate">
                              UA: <span className="font-semibold">{uaList[0]}</span>
                              {uaList.length > 1 && <span className="text-gray-400"> (+{uaList.length - 1})</span>}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => restoreAttemptItem(rep)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          <HiArrowPath className="w-4 h-4" />
                          Restore
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'blocks' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <HiLockClosed className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>

              <div className="min-w-0">
                <p className="text-gray-900 dark:text-white font-extrabold text-lg truncate">SL Blocks</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {loadingBlocked
                    ? 'Memuat...'
                    : `${groupedBlocks.length} group${query.trim() ? ' (filtered)' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreAllBlocks}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <HiRefresh className="w-4 h-4" />
                Restore All
              </button>
            </div>
          </div>

          <div className="p-5">
            {loadingBlocked ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Memuat data...</div>
            ) : groupedBlocks.length === 0 ? (
              <div className="text-center py-10">
                <HiLockOpen className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-semibold">Tidak ada SL Blocks</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {query.trim() ? 'Tidak ada data yang cocok dengan filter.' : 'Lakukan 10x gagal untuk membuat block.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedBlocks.map((group) => {
                  const rep = group.representative;
                  const who = whoForBlock(rep);

                  const reasons = Array.from(
                    new Set(group.items.map((x) => (x.reason ? x.reason.trim() : '')).filter(Boolean))
                  );

                  return (
                    <div
                      key={group.key}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{who}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="truncate">
                            Blocked: <span className="font-semibold">{blockedUntilText(rep)}</span>
                          </span>
                          <span className="truncate">
                            Count: <span className="font-semibold">{group.items.length}</span>
                          </span>
                          {reasons.length > 0 && (
                            <span className="truncate">
                              Reason: <span className="font-semibold">{reasons[0]}</span>
                              {reasons.length > 1 && <span className="text-gray-400"> (+{reasons.length - 1})</span>}
                            </span>
                          )}
                          <span className="truncate">
                            At: <span className="font-semibold">{fmtDate(rep.created_at)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => restoreBlockItem(rep)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          <HiArrowPath className="w-4 h-4" />
                          Restore
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
