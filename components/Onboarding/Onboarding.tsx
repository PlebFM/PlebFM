import Image from 'next/image';
import Avatar from '../Utils/Avatar';
import Button from '../Utils/Button';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CrossIcon,
} from '@bitcoin-design/bitcoin-icons-react/outline';
import Boop from '../Utils/Boop';
import React from 'react';
import OnboardingAnimation from './OnboardingAnimation';

interface OnboardingProps {
  generateUserFunc: () => void;
}

const slides = [
  {
    text: 'Welcome to PlebFM, the lightning jukebox. Here’s how it works.',
    contBtnActive: true,
  },
  {
    text: 'Search for your favorite song in the whole world.',
    contBtnActive: true,
  },
  {
    text: 'Pay for it with your favorite lightning wallet.',
    contBtnActive: true,
  },
  {
    text: 'Outbid others to push your song to the top of the queue.',
    contBtnActive: true,
  },
  {
    text: 'One moment. Generating your secret identity...',
    contBtnActive: false,
  },
];

export default function Onboarding(props: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (currentSlide === slides.length - 1) {
      props.generateUserFunc();
    }
  }, [currentSlide, props]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) gotoSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) gotoSlide(currentSlide - 1);
  };

  const gotoSlide = (slide: number) => {
    setCurrentSlide(slide);
  };

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <Image
          src={'/pfm-bokeh-1.jpg'}
          alt=""
          width="1"
          height="1"
          className="object-cover w-full h-full blur-2xl opacity-75"
        />
      </div>

      <div className="px-6 py-12 text-white relative z-50 justify-between flex flex-col space-y-6 items-center min-h-screen font-thin">
        {currentSlide < slides.length - 1 ? (
          <div>
            <OnboardingAnimation />
          </div>
        ) : (
          <div className="w-2/3 mx-auto flex flex-col space-y-4 text-center">
            <Avatar />
            <p className="text-2xl">- - -</p>
          </div>
        )}

        <div className="text-3xl leading-relaxed text-center">
          {currentSlide < slides.length - 1 ? (
            <p>{slides[currentSlide].text}</p>
          ) : (
            <div>
              <p>{slides[currentSlide].text}</p>
            </div>
          )}
        </div>

        <Button
          size="large"
          icon={<ArrowRightIcon />}
          onClick={nextSlide}
          disabled={!slides[currentSlide].contBtnActive}
        >
          Continue
        </Button>

        <div className="flex flex-row space-x-4">
          {currentSlide > 0 ? (
            <Button
              icon={<ArrowLeftIcon />}
              iconPosition="left"
              size="small"
              style="free"
              onClick={prevSlide}
            >
              Back
            </Button>
          ) : (
            ``
          )}

          {currentSlide < slides.length - 1 ? (
            <Button
              icon={<CrossIcon />}
              iconPosition="left"
              size="small"
              style="free"
              onClick={() => {
                gotoSlide(slides.length - 1);
              }}
            >
              Skip
            </Button>
          ) : (
            ``
          )}
        </div>

        <div className="flex space-x-6">
          {slides.map((slide, key) => (
            <Boop active={currentSlide === key} key={key} />
          ))}
        </div>
      </div>
    </>
  );
}
