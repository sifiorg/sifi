import { StoryFn, Meta } from "@storybook/react";
import { Spinner } from "./Spinner";

export default {
  title: "Components/Spinner",
  component: Spinner,
} as Meta<typeof Spinner>;

const Template: StoryFn<typeof Spinner> = () => <Spinner />;

export const Default = Template.bind({});
