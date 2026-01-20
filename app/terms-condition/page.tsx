import Link from 'next/link';
import { HiArrowLeft, HiDocumentText } from 'react-icons/hi2';

export const metadata = {
    title: 'Syarat & Ketentuan - Drive Ogan Ilir',
    description: 'Syarat dan ketentuan penggunaan aplikasi Drive Ogan Ilir',
};

export default function TermsConditionPage() {
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
                            <HiDocumentText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Syarat & Ketentuan
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
                            1. Penerimaan Ketentuan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Dengan mengakses dan menggunakan aplikasi Drive Ogan Ilir ("Layanan"), Anda menyetujui untuk terikat
                            oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui syarat-syarat ini, mohon untuk tidak
                            menggunakan Layanan kami. Layanan ini disediakan oleh Pemerintah Kabupaten Ogan Ilir melalui
                            Dinas Komunikasi dan Informatika.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            2. Deskripsi Layanan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Drive Ogan Ilir adalah layanan penyimpanan cloud yang memungkinkan pengguna untuk:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Menyimpan, mengakses, dan mengelola file secara online</li>
                            <li>Membuat dan mengorganisir folder</li>
                            <li>Berbagi file dan folder dengan pengguna lain</li>
                            <li>Mengakses file dari berbagai perangkat</li>
                            <li>Melakukan sinkronisasi data</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            3. Kelayakan dan Registrasi
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    3.1 Kelayakan Pengguna
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Layanan ini diperuntukkan bagi pegawai dan instansi di lingkungan Pemerintah Kabupaten Ogan Ilir.
                                    Anda harus memiliki otorisasi yang sah untuk menggunakan layanan ini.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    3.2 Keakuratan Informasi
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Anda bertanggung jawab untuk memberikan informasi yang akurat dan lengkap saat mendaftar.
                                    Anda wajib memperbarui informasi akun Anda jika ada perubahan.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    3.3 Keamanan Akun
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi akun Anda. Segera laporkan
                                    kepada administrator jika Anda menduga adanya penggunaan tidak sah terhadap akun Anda.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            4. Penggunaan yang Dapat Diterima
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Saat menggunakan Layanan, Anda setuju untuk TIDAK:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Mengunggah konten yang melanggar hukum, melanggar hak cipta, atau tidak pantas</li>
                            <li>Menyebarkan malware, virus, atau kode berbahaya lainnya</li>
                            <li>Menggunakan layanan untuk tujuan komersial tanpa izin</li>
                            <li>Mengakses akun pengguna lain tanpa otorisasi</li>
                            <li>Mengganggu atau merusak infrastruktur layanan</li>
                            <li>Menyalahgunakan sistem atau melampaui batas penggunaan yang wajar</li>
                            <li>Berbagi akses akun Anda dengan pihak yang tidak berwenang</li>
                            <li>Menggunakan layanan untuk menyimpan konten ilegal atau melanggar SARA</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            5. Konten Pengguna
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    5.1 Kepemilikan Konten
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Anda tetap memiliki hak kepemilikan penuh atas semua konten yang Anda upload ke Layanan.
                                    Kami tidak mengklaim kepemilikan atas konten Anda.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    5.2 Lisensi Penggunaan
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Dengan mengunggah konten, Anda memberikan kami lisensi terbatas untuk menyimpan, memproses,
                                    dan menampilkan konten Anda semata-mata untuk tujuan menyediakan Layanan kepada Anda.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    5.3 Tanggung Jawab Konten
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Anda bertanggung jawab penuh atas konten yang Anda unggah dan bagikan. Kami berhak menghapus
                                    konten yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            6. Batasan Penyimpanan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Setiap akun memiliki kuota penyimpanan yang ditentukan oleh administrator. Batasan ini meliputi:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Kapasitas penyimpanan maksimal per akun</li>
                            <li>Ukuran file maksimal per upload</li>
                            <li>Jumlah file dan folder yang dapat dibuat</li>
                            <li>Bandwidth transfer data</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                            Administrator dapat mengubah batasan ini sewaktu-waktu berdasarkan kebutuhan dan kapasitas sistem.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            7. Ketersediaan Layanan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kami berupaya menyediakan layanan 24/7, namun tidak menjamin ketersediaan tanpa gangguan.
                            Layanan dapat mengalami downtime karena pemeliharaan, upgrade, atau masalah teknis.
                            Kami tidak bertanggung jawab atas kehilangan data atau kerusakan yang timbul dari gangguan layanan.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            8. Backup dan Pemulihan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Meskipun kami melakukan backup rutin, Anda tetap bertanggung jawab untuk:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Membuat salinan cadangan data penting Anda</li>
                            <li>Memastikan data yang diunggah tidak rusak atau korup</li>
                            <li>Memeriksa integritas file secara berkala</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                            Kami tidak menjamin pemulihan data 100% dalam kasus kehilangan data atau kerusakan sistem.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            9. Penghentian Akun
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    9.1 Penghentian oleh Pengguna
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Anda dapat menghapus akun Anda kapan saja dengan menghubungi administrator.
                                    Penghapusan akun akan mengakibatkan penghapusan permanen semua data Anda.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    9.2 Penghentian oleh Kami
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Kami berhak menonaktifkan atau menghapus akun Anda jika:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 ml-4 space-y-1">
                                    <li>Melanggar Syarat dan Ketentuan ini</li>
                                    <li>Menggunakan layanan untuk tujuan ilegal</li>
                                    <li>Akun tidak aktif dalam jangka waktu tertentu</li>
                                    <li>Atas permintaan atasan atau administrator</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            10. Pembatasan Tanggung Jawab
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            Layanan disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami tidak bertanggung jawab atas:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Kehilangan data atau kerusakan file</li>
                            <li>Gangguan layanan atau downtime</li>
                            <li>Kerugian finansial atau bisnis</li>
                            <li>Akses tidak sah ke akun Anda</li>
                            <li>Kerusakan yang disebabkan oleh virus atau malware</li>
                            <li>Kesalahan atau ketidakakuratan dalam konten</li>
                        </ul>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            11. Ganti Rugi
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Anda setuju untuk mengganti rugi dan membebaskan Pemerintah Kabupaten Ogan Ilir dari setiap klaim,
                            kerugian, atau kerusakan yang timbul dari penggunaan Layanan oleh Anda atau pelanggaran terhadap
                            Syarat dan Ketentuan ini.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            12. Perubahan Ketentuan
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah
                            dipublikasikan di aplikasi. Penggunaan berkelanjutan Anda atas Layanan setelah perubahan
                            menandakan persetujuan Anda terhadap ketentuan yang diperbarui.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            13. Hukum yang Berlaku
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
                            Setiap perselisihan yang timbul akan diselesaikan di pengadilan yang berwenang di wilayah
                            Kabupaten Ogan Ilir.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#003a69] dark:text-[#ebbd18] mb-4">
                            14. Kontak
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            Untuk pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi:
                        </p>
                        <div className="bg-[#003a69]/5 dark:bg-[#ebbd18]/5 rounded-lg p-4 space-y-2">
                            <p className="text-gray-700 dark:text-gray-300">
                                <strong>Dinas Komunikasi dan Informatika</strong>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                <strong>Kabupaten Ogan Ilir</strong>
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
                            Dengan menggunakan Drive Ogan Ilir, Anda menyatakan telah membaca, memahami, dan menyetujui
                            untuk terikat oleh Syarat dan Ketentuan ini.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
