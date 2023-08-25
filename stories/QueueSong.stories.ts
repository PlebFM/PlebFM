import type { Meta, StoryObj } from '@storybook/react';
import QueueSong from '../components/QueueSong';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta: Meta<typeof QueueSong> = {
  title: 'PlebFM/QueueSong',
  component: QueueSong,
  tags: ['autodocs'],
  argTypes: {
    song: {
      trackTitle: {
        name: 'Text',
        type: { name: 'string', required: true },
        defaultValue: 'Track Title',
        description: 'Title of track',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'Track Title' },
        },
        control: {
          type: 'text',
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof QueueSong>;

const FluffyHoneyBadger = {
  firstNym: 'Fluffy',
  lastNym: 'Honeybadger',
  avatar: 'teal',
  userId: '1234567890',
};

const ZazzyFawkes = {
  firstNym: 'Zazzy',
  lastNym: 'Fawkes',
  avatar: 'orange',
  userId: '1234567890',
};

const BasedChaditha = {
  firstNym: 'Based',
  lastNym: 'Chaditha',
  avatar: 'purpleLight',
  userId: '1234567890',
};

const WonderfulKitty = {
  firstNym: 'Wonderful',
  lastNym: 'Kitty',
  avatar: 'purpleDark',
  userId: '1234567890',
};

const SquealingBankasaurus = {
  firstNym: 'Squealing',
  lastNym: 'Bankasaurus',
  avatar: 'orangeDark',
  userId: '1234567890',
};

const SilentGoldbug = {
  firstNym: 'Silent',
  lastNym: 'Goldbug',
  avatar: 'tealLight',
  userId: '1234567890',
};

// export const Default: Story = {
//   args: {
//     trackTitle: 'The Devil Went Down to Georgia',
//     artistName: 'Charlie Daniels Band',
//     feeRate: 70,
//     bidders: [BasedChaditha, WonderfulKitty],
//   },
// };

export const Default: Story = {
  args: {
    song: {
      trackTitle: 'The Devil Went Down to Georgia',
      artistName: 'Charlie Daniels Band',
      feeRate: 70,
      bidders: [BasedChaditha, WonderfulKitty],
      playing: false,
      upNext: false,
    },
  },
};

export const Boosted: Story = {
  args: {
    song: {
      trackTitle: 'ATLiens',
      artistName: 'Outkast',
      feeRate: 132,
      bidders: [BasedChaditha, ZazzyFawkes, SilentGoldbug],
      playing: false,
      upNext: false,
    },
    boosted: true,
  },
};

export const NowPlaying: Story = {
  args: {
    song: {
      trackTitle: "Hips Don't Lie",
      artistName: 'Shakira',
      feeRate: 100,
      playing: true,
      upNext: false,
      bidders: [FluffyHoneyBadger, ZazzyFawkes, BasedChaditha, WonderfulKitty],
    },
    boosted: false,
  },
};

export const UpNext: Story = {
  args: {
    song: {
      trackTitle: 'March of the Pigs',
      artistName: 'Nine Inch Nails',
      feeRate: 80,
      playing: false,
      upNext: true,
      bidders: [
        FluffyHoneyBadger,
        BasedChaditha,
        WonderfulKitty,
        SquealingBankasaurus,
        ZazzyFawkes,
        SilentGoldbug,
      ],
    },
  },
};

// const Template = (args) => ({
//   //👇 Your template goes here
// });
//
// export const CustomSource = Template.bind({});
// CustomSource.parameters = {
//   docs: {
//     source: {
//       code: 'Your code snippet goes here.',
//       language: "yml",
//       type: "auto",
//     },
//   },
// };
