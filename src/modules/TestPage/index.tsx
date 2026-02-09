import type { NextPageWithLayout } from '@/types';

const TestPage: NextPageWithLayout = () => {
  return (
    <>
      <div className="relative">
        <div
          className="flex justify-center items-center absolute w-86 h-40 left-52 top-5
                    bg-gradient-to-b from-[#EDFFC2] to-[#D3FE6F] border border-[#B9E15B]
                    rounded-full transition duration-300 ease-in-out hover:from-[#D3FE6F] hover:to-[#EDFFC2]"
        >
          <div className="absolute left-4 right-4 bottom-0 h-4 bg-[#B9E15B] blur-effect hidden group-hover:block"></div>
          <span className="font-[DIN Pro] font-medium text-14 text-[#3D4F13] uppercase z-10 text-center">
            Nhấn vào đây
          </span>
        </div>
      </div>
    </>
  );
};

export default TestPage;
