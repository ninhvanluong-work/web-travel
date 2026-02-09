import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { type NextPageWithLayout } from '@/types';

const ButtonPage: NextPageWithLayout = () => {
  return (
    <>
      <PrimaryButton></PrimaryButton>
      <br />
      <SecondaryButton></SecondaryButton>
      <br />
      <GhostButton></GhostButton>
    </>
  );
};

const PrimaryButton = () => {
  return (
    <>
      <div className="container flex flex-col gap-5">
        <p className="text-2xl">Primary Button</p>
        <p className="text-2xl">Size - 40px</p>
        <div className="">
          <div className="flex gap-20">
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'}>
                BUTTON
              </Button>
              <p>NORMAL</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'}>
                BUTTON
              </Button>
              <p>HOVER</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'}>
                BUTTON
              </Button>
              <p>PRESSED</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} loading={true} blur={false}>
                BUTTON
              </Button>
              <p>LOADING</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} disabled={true} blur={false} variant={'disable'}>
                BUTTON
              </Button>
              <p>DISABLE</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[7rem] flex gap-1'}>
                BUTTON
                <Icons.arrowRight />
              </Button>
              <p>ICON RIGHT</p>
            </div>

            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[7rem] flex gap-1'}>
                <Icons.arrowLeft />
                BUTTON
              </Button>
              <p>ICON LEFT</p>
            </div>

            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[2.5rem] flex gap-1'}>
                <Icons.arrowLeft />
              </Button>
              <p>ICON LEFT</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SecondaryButton = () => {
  return (
    <>
      <div className="container flex flex-col gap-5">
        <p className="text-2xl">Secondary Button</p>
        <p className="text-2xl">Size - 40px</p>
        <div className="">
          <div className="flex gap-20">
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} variant={'secondary'} blur={false}>
                BUTTON
              </Button>
              <p>NORMAL</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} variant={'secondary'} blur={false}>
                BUTTON
              </Button>
              <p>HOVER</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} variant={'secondary'} blur={false}>
                BUTTON
              </Button>
              <p>PRESSED</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} loading={true} variant={'secondary'} blur={false}>
                BUTTON
              </Button>
              <p>LOADING</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} disabled={true} variant={'disable'} blur={false}>
                BUTTON
              </Button>
              <p>DISABLE</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[7rem] flex gap-1'} variant={'secondary'} blur={false}>
                BUTTON
                <Icons.arrowRight />
              </Button>
              <p>ICON RIGHT</p>
            </div>

            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[7rem] flex gap-1'} variant={'secondary'} blur={false}>
                <Icons.arrowLeft />
                BUTTON
              </Button>
              <p>ICON LEFT</p>
            </div>

            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[2.5rem] flex gap-1'} variant={'secondary'} blur={false}>
                <Icons.arrowLeft />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const GhostButton = () => {
  return (
    <>
      <div className="container flex flex-col gap-5">
        <p className="text-2xl">Ghost Button</p>
        <p className="text-2xl">Size - 40px</p>
        <div className="">
          <div className="flex gap-20">
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} variant={'ghost'} blur={false}>
                BUTTON
              </Button>
              <p>NORMAL</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} variant={'ghost'} blur={false}>
                BUTTON
              </Button>
              <p>HOVER</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} variant={'ghost'} blur={false}>
                BUTTON
              </Button>
              <p>PRESSED</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} loading={true} variant={'ghost'} blur={false}>
                BUTTON
              </Button>
              <p>LOADING</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[5.375rem]'} disabled={true} variant={'ghost'} blur={false}>
                BUTTON
              </Button>
              <p>DISABLE</p>
            </div>
            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[7rem] flex gap-1'} variant={'ghost'} blur={false}>
                BUTTON
                <Icons.arrowRight />
              </Button>
              <p>ICON RIGHT</p>
            </div>

            <div className={'flex flex-col gap-3 text-center'}>
              <Button size={'lg'} className={'w-[7rem] flex gap-1'} variant={'ghost'} blur={false}>
                <Icons.arrowLeft />
                BUTTON
              </Button>
              <p>ICON LEFT</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ButtonPage;
