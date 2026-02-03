import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Web travel',
    description: 'come to travel with me',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='vi'>
            <body className='bg-slate-900 flex justify-center items-center min-h-screen'>
                <div className='relative w-full max-w-[430px] h-[100vh] md:h-[850px] bg-white md:rounded-[3rem] md:border-[12px] md:border-black shadow-2xl overflow-hidden pointer-events-auto'>
                    <main className='h-full overflow-y-auto scrollbar-hide'>{children}</main>
                </div>
            </body>
        </html>
    );
}
