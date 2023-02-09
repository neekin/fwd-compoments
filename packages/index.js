import WorkFlow from "./WorkFlow";

export { WorkFlow };

const components = [WorkFlow];

const install = (App) => {
  components.forEach((item) => {
    App.components(item.__name, item);
  });
};
export default {
  install,
};
