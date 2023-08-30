// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import Tag from '../components/Utils/Tag';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta: Meta<typeof Tag> = {
  title: 'PlebFM/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    text: {
      name: 'Text',
      type: { name: 'string', required: true },
      defaultValue: 'Tag',
      description: 'Text for the tag',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Tag' },
      },
      control: {
        type: 'text',
      },
    },
    color: {
      name: 'Color',
      type: { name: 'string', required: false },
      defaultValue: 'orange',
      description:
        'Choose a tag color from the PlebFM palette. Orange (default), purple, or teal.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'orange' },
      },
      control: 'select',
      options: ['orange', 'purple', 'teal'],
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
