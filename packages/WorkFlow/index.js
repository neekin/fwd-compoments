import WorkFlow from "./src/work-flow.vue";
WorkFlow.install = (App) => {
  App.component(WorkFlow.__name, WorkFlow);
};

export default WorkFlow;
