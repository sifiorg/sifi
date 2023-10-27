import { rest } from 'msw';
import { StoryFn } from '@storybook/react';
import isChromatic from 'chromatic/isChromatic';
import { RecentWarps } from './RecentWarps';
import GRAPH_URLS from 'src/subgraph.json';

export default {
  title: 'Components/RecentWarps',
  component: RecentWarps,
};

const Template: StoryFn<typeof RecentWarps> = () => <RecentWarps />;

export const Default: StoryFn = Template.bind({});

// TODO: Fix loading story
export const Loading: StoryFn = Template.bind({});
Loading.parameters = {
  msw: [
    rest.get(GRAPH_URLS[1], (_req, res, ctx) => {
      return res(ctx.delay(isChromatic() ? 5000 : 'infinite'));
    }),
  ],
};

// TODO: Fix error story
export const Error: StoryFn = Template.bind({});
