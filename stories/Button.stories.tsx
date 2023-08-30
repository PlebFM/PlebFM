import type { Meta, StoryObj } from '@storybook/react';
import Button from '../components/Utils/Button';
import {
  ArrowRightIcon,
  CheckIcon,
  CrossIcon,
} from '@bitcoin-design/bitcoin-icons-react/outline';

const icons = {
  ArrowRightIcon: <ArrowRightIcon />,
  CheckIcon: <CheckIcon />,
  CrossIcon: <CrossIcon />,
};

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta: Meta<typeof Button> = {
  title: 'PlebFM/Button',
  component: Button,
  argTypes: {
    icon: {
      options: Object.keys(icons),
      mapping: icons,
      control: {
        type: 'select',
        labels: {
          ArrowRightIcon: 'Arrow',
          CheckIcon: 'Check',
          CrossIcon: 'Cross',
        },
      },
    },
    size: {
      name: 'Size',
      type: { name: 'string', required: false },
      defaultValue: 'default',
      description: 'Choose a size: small, default, or large',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
      control: 'select',
      options: ['small', 'default', 'large'],
    },
    style: {
      name: 'Style',
      type: { name: 'string', required: false },
      defaultValue: 'default',
      description: 'Choose a style: default or free',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
      control: 'select',
      options: ['default', 'free'],
    },
    iconPosition: {
      name: 'Icon Position',
      type: { name: 'string', required: false },
      defaultValue: 'default',
      description: 'Choose a style: left or right (default)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
      control: 'select',
      options: ['left', 'right'],
    },
    color: {
      name: 'Color',
      type: { name: 'string', required: false },
      defaultValue: 'default',
      description: 'Choose a color: orange or white (default).',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
      control: 'select',
      options: ['white', 'orange'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Default: Story = {
  args: {
    children: 'Continue',
  },
};

export const DefaultWithIcon: Story = {
  args: {
    children: 'Continue',
    icon: <ArrowRightIcon />,
  },
};

export const Large: Story = {
  args: {
    children: 'Continue',
    size: 'large',
  },
};

export const Small: Story = {
  args: {
    children: 'Continue',
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    children: "U Can't Touch This",
    disabled: true,
  },
};
