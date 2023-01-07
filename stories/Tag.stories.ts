import type { Meta, StoryObj } from '@storybook/react';
import Tag from '../components/Tag';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta: Meta<typeof Tag> = {
  title: 'PlebFM/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Orange: Story = {
  args: {
    text: 'Your Pick',
  },
};

export const Purple: Story = {
  args: {
    text: 'In Queue',
    color: 'purple',
  },
};

export const Teal: Story = {
  args: {
    text: 'Up Next',
    color: 'teal',
  },
};
