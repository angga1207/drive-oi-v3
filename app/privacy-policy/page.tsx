import Link from 'next/link';
import { HiArrowLeft, HiShieldCheck } from 'react-icons/hi2';

export const metadata = {
    title: 'Kebijakan Privasi - Drive Ogan Ilir',
    description: 'Kebijakan privasi aplikasi Drive Ogan Ilir',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[#003a69] dark:text-[#ebbd18] hover:underline mb-6"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        Kembali ke Beranda
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-[#003a69] to-[#005a9c] rounded-xl">
                            <HiShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Kebijakan Privasi
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Terakhir diperbarui: 20 Januari 2026
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            1. Pendahuluan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Drive Ogan Ilir ("kami", "kami", atau "milik kami") berkomitmen untuk melindungi privasi Anda.
                            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan
                            melindungi informasi pribadi Anda saat Anda menggunakan aplikasi penyimpanan cloud Drive Ogan Ilir.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            2. Informasi yang Kami Kumpulkan
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    2.1 Informasi Akun
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Saat Anda mendaftar untuk Drive Ogan Ilir, kami mengumpulkan:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 ml-4 space-y-1">
                                    <li>Nama lengkap</li>
                                    <li>Username</li>
                                    <li>Alamat email</li>
                                    <li>Kata sandi (dienkripsi)</li>
                                    <li>Foto profil (opsional)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    2.2 Konten yang Anda Upload
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Kami menyimpan file dan folder yang Anda upload ke layanan kami, termasuk:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 ml-4 space-y-1">
                                    <li>Dokumen, gambar, video, dan file lainnya</li>
                                    <li>Metadata file (nama, ukuran, tanggal modifikasi)</li>
                                    <li>Struktur folder dan organisasi</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    2.3 Informasi Penggunaan
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Kami mengumpulkan informasi tentang bagaimana Anda menggunakan layanan kami:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 ml-4 space-y-1">
                                    <li>Log aktivitas (upload, download, berbagi)</li>
                                    <li>Alamat IP dan informasi perangkat</li>
                                    <li>Browser dan sistem operasi</li>
                                    <li>Waktu dan durasi penggunaan</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            3. Bagaimana Kami Menggunakan Informasi Anda
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Kami menggunakan informasi yang dikumpulkan untuk:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Menyediakan dan memelihara layanan penyimpanan cloud</li>
                            <li>Memproses upload, download, dan sinkronisasi file</li>
                            <li>Mengelola akun dan autentikasi pengguna</li>
                            <li>Meningkatkan keamanan dan mencegah penyalahgunaan</li>
                            <li>Memberikan dukungan teknis dan layanan pelanggan</li>
                            <li>Menganalisis penggunaan untuk meningkatkan layanan</li>
                            <li>Mengirim pemberitahuan penting tentang layanan</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            4. Keamanan Data
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data Anda:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Enkripsi data saat transit (HTTPS/TLS)</li>
                            <li>Enkripsi kata sandi menggunakan algoritma bcrypt</li>
                            <li>Akses terbatas ke data pengguna</li>
                            <li>Pemantauan keamanan secara berkala</li>
                            <li>Backup data secara rutin</li>
                            <li>Proteksi terhadap serangan siber</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            5. Berbagi dan Pengungkapan Data
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga.
                            Kami hanya akan berbagi informasi Anda dalam situasi berikut:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li><strong>Dengan persetujuan Anda:</strong> Ketika Anda membagikan file dengan pengguna lain</li>
                            <li><strong>Untuk kepatuhan hukum:</strong> Jika diwajibkan oleh hukum atau proses hukum</li>
                            <li><strong>Untuk keamanan:</strong> Untuk melindungi hak, properti, atau keselamatan</li>
                            <li><strong>Penyedia layanan:</strong> Dengan vendor pihak ketiga yang membantu operasi kami</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            6. Hak Anda
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Anda memiliki hak berikut terkait data pribadi Anda:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li><strong>Akses:</strong> Melihat informasi pribadi yang kami miliki tentang Anda</li>
                            <li><strong>Koreksi:</strong> Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                            <li><strong>Penghapusan:</strong> Meminta penghapusan akun dan data Anda</li>
                            <li><strong>Portabilitas:</strong> Mengunduh data Anda dalam format yang dapat dibaca</li>
                            <li><strong>Pembatasan:</strong> Membatasi pemrosesan data Anda</li>
                            <li><strong>Keberatan:</strong> Menolak penggunaan data tertentu</li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            7. Penyimpanan Data
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kami menyimpan data Anda selama akun Anda aktif atau sepanjang diperlukan untuk menyediakan layanan.
                            Jika Anda menghapus akun, kami akan menghapus data Anda dalam waktu 30 hari, kecuali kami diwajibkan
                            secara hukum untuk menyimpannya lebih lama.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            8. Cookies dan Teknologi Pelacakan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman Anda, mengingat preferensi,
                            dan menganalisis penggunaan layanan. Anda dapat mengontrol cookies melalui pengaturan browser Anda.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            9. Perubahan Kebijakan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang
                            perubahan material dengan memposting kebijakan baru di aplikasi dan memperbarui tanggal "Terakhir diperbarui"
                            di bagian atas dokumen ini.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            10. Hubungi Kami
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau praktik data kami,
                            silakan hubungi kami melalui:
                        </p>
                        <div className="bg-[#003a69]/5 dark:bg-[#ebbd18]/5 rounded-lg p-4 space-y-2">
                            <p className="text-gray-700 dark:text-gray-300">
                                <strong>Pemerintah Kabupaten Ogan Ilir</strong>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Email: <a href="mailto:diskominfo@oganilirkab.go.id" className="text-[#003a69] dark:text-[#ebbd18] hover:underline">
                                    diskominfo@oganilirkab.go.id
                                </a>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                WhatsApp: <a href="https://wa.me/6281255332004" className="text-[#003a69] dark:text-[#ebbd18] hover:underline">
                                    +62 812-5533-2004
                                </a>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Website: <a href="https://diskominfo.oganilirkab.go.id" className="text-[#003a69] dark:text-[#ebbd18] hover:underline">
                                    https://diskominfo.oganilirkab.go.id
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Dengan menggunakan Drive Ogan Ilir, Anda menyetujui pengumpulan dan penggunaan informasi
                            sesuai dengan Kebijakan Privasi ini.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
