import FavoriteListClient from "@/components/FavoriteListClient";


export const metadata = {
    title: 'Favorite - Drive Ogan Ilir',
    description: 'Your favorite files and folders',
};

export default async function FavoritePage() {
    return (
        <div className="min-h-screen">
            <FavoriteListClient />
        </div>
    );
}
