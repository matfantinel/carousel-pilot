/** @type { import('@storybook/sveltekit').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
      expanded: true
    }
  }
};

export default preview;