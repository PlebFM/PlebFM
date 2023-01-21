import type { Meta, StoryObj } from '@storybook/react';
import QueueSong from '../components/QueueSong';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta: Meta<typeof QueueSong> = {
  title: 'PlebFM/QueueSong',
  component: QueueSong,
  tags: ['autodocs'],
  argTypes: {
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
};

export default meta;
type Story = StoryObj<typeof QueueSong>;

const FluffyHoneyBadger = {
  firstNym: 'Fluffy',
  lastNym: 'Honeybadger',
  color: 'teal',
};

const ZazzyFawkes = {
  firstNym: 'Zazzy',
  lastNym: 'Fawkes',
  color: 'orange',
};

const BasedChaditha = {
  firstNym: 'Based',
  lastNym: 'Chaditha',
  color: 'purpleLight',
};

const WonderfulKitty = {
  firstNym: 'Wonderful',
  lastNym: 'Kitty',
  color: 'purpleDark',
};

const SquealingBankasaurus = {
  firstNym: 'Squealing',
  lastNym: 'Bankasaurus',
  color: 'orangeDark',
};

const SilentGoldbug = {
  firstNym: 'Silent',
  lastNym: 'Goldbug',
  color: 'tealLight',
};

export const Default: Story = {
  args: {
    trackTitle: 'The Devil Went Down to Georgia',
    artistName: 'Charlie Daniels Band',
    feeRate: 70,
    bidders: [BasedChaditha, WonderfulKitty],
  },
};

export const Boosted: Story = {
  args: {
    trackTitle: 'ATLiens',
    artistName: 'Outkast',
    feeRate: 132,
    boosted: true,
    bidders: [BasedChaditha, ZazzyFawkes, SilentGoldbug],
  },
};

export const NowPlaying: Story = {
  args: {
    trackTitle: "Hips Don't Lie",
    artistName: 'Shakira',
    feeRate: 100,
    playing: true,
    upNext: false,
    bidders: [FluffyHoneyBadger, ZazzyFawkes, BasedChaditha, WonderfulKitty],
  },
};

export const UpNext: Story = {
  args: {
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
