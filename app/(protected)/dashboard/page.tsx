import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getProfileService } from '@/lib/services/auth.service';
import { HiDocumentText, HiFolder, HiLink, HiEllipsisVertical } from 'react-icons/hi2';
import { BiSolidData } from 'react-icons/bi';
import { HiThumbUp } from 'react-icons/hi';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile data from backend
    const profileResponse = await getProfileService();
    const profileData: any = profileResponse.success ? profileResponse.data : null;

    const stats: any[] = [
        {
            title: 'Total Storage',
            value: profileData?.storage?.total || user.storage.total,
            used: profileData?.storage?.used || user.storage.used,
            icon: <BiSolidData className="w-6 h-6 text-white" />,
            color: 'from-[#003a69] to-[#005a9c]',
            percentage: profileData?.storage?.percent ? profileData.storage.percent : user.storage.percent,
        },
        {
            title: 'Files',
            value: profileData?.datas?.files || '0',
            description: 'Total files',
            icon: <HiDocumentText className="w-6 h-6 text-white" />,
            color: 'from-[#005a9c] to-[#003a69]',
        },
        {
            title: 'Folders',
            value: profileData?.datas?.folders || '0',
            description: 'Total folders',
            icon: <HiFolder className="w-6 h-6 text-white" />,
            color: 'from-[#ebbd18] to-[#c79a00]',
        },
        {
            title: 'Shared',
            value: profileData?.datas?.shared || '0',
            description: 'Shared items',
            icon: <HiLink className="w-6 h-6 text-white" />,
            color: 'from-[#003a69] to-[#ebbd18]',
        },
    ];

    const recentFiles = [
        { name: 'Project Proposal.pdf', size: '2.4 MB', modified: '2 hours ago', type: 'pdf' },
        { name: 'Meeting Notes.docx', size: '156 KB', modified: '5 hours ago', type: 'doc' },
        { name: 'Budget 2026.xlsx', size: '890 KB', modified: '1 day ago', type: 'excel' },
        { name: 'Presentation.pptx', size: '5.2 MB', modified: '2 days ago', type: 'ppt' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-[#003a69] to-[#005a9c] bg-clip-text text-transparent mb-2 flex items-center gap-2">
                    Selamat Datang, {user.name.firstname}! <HiThumbUp className="text-[#ebbd18]" />
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Berikut adalah ringkasan penyimpanan Anda hari ini.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-2 border-[#ebbd18]/20 hover:border-[#ebbd18]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#003a69]/10">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {stat.title}
                            </h3>
                            <p className="text-2xl font-bold text-[#003a69] dark:text-white mb-1">
                                {stat.value}
                            </p>
                            {stat.used && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        <span>{stat.used} used</span>
                                        <span>{Math.round(stat.percentage)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-linear-to-r ${stat.color} transition-all duration-500`}
                                            style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            {stat.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {stat.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Files */}
            <Card className="border-2 border-[#ebbd18]/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[#003a69] dark:text-white">File Terbaru</CardTitle>
                            <CardDescription>File yang baru saja Anda akses</CardDescription>
                        </div>
                        <button className="text-sm text-[#003a69] dark:text-[#ebbd18] hover:underline font-medium transition-colors">
                            Lihat Semua
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#ebbd18]/5 dark:hover:bg-[#003a69]/10 transition-colors cursor-pointer group"
                            >
                                <div className="w-10 h-10 bg-linear-to-br from-[#003a69] to-[#005a9c] rounded-lg flex items-center justify-center text-xl shrink-0">
                                    <HiDocumentText className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-[#003a69] dark:group-hover:text-[#ebbd18] transition-colors">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {file.size} • {file.modified}
                                    </p>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <HiEllipsisVertical className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
