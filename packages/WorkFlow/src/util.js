import { fittingString } from "@/components/extend/workflow/util";
const initNodes = () => [
  {
    id: "0",
    label: "Start",
  },
];

export default {
  namespaced: true,
  getters: {
    getReRender: (state) => state.reRender,
    getReRenderKeep: (state) => state.reRenderKeep,
    getOwnerMap: (state) => {
      return state.nodes.reduce((map, node) => {
        let nmap = { ...map };
        if (node.owners) {
          node?.owners.forEach((group) => {
            if (!nmap[group.title]) {
              nmap[group.title] = group.children;
            } else {
              const current = nmap[group.title];
              const filter = group?.children.filter(
                (user) =>
                  current.findIndex((item) => item.id === user.id) === -1
              );
              nmap[group.title] = current.concat(filter);
            }
          });
        }
        return nmap;
      }, {});
    },
    getCurrentNode: (state) => state.currentNode,
    getContainer: (state) => state.container,
    getCurrentOwners: (state) => state.currentNode?.owners,
    getCurrentOwnersKeys: (state) => {
      if (
        !state.currentNode ||
        !state.currentNode.owners ||
        state.currentNode.owners.length == 0
      ) {
        return [];
      }
      let selectKeys = [];
      let num = 0;
      state.currentNode.owners.forEach((group) => {
        group.children.forEach((owner) => {
          selectKeys[num] = owner.key;
          ++num;
        });
      });
      return selectKeys;
    },
    getNodeList: (state) => {
      const nodes = state.nodes.map((item, index) => {
        if (index == 0) {
          return item;
        }
        let names = [];
        let num = 1;
        if (item.owners) {
          item.owners.forEach((group) => {
            group.children.forEach((owner) => {
              names.push(fittingString(`${num}. ${owner.title}`, 230, 14));
              ++num;
            });
          });
        }
        if (names.length > 0) {
          if (names.length > 4) {
            names.length = 4;
            names.push("...");
          }
          item.label = names.join("\n");
        } else if (item.owners.length == 0) {
          item.label = "";
        }
        return item;
      });

      return {
        nodes: nodes,
        edges: state.edges,
      };
    },
    getWorkFlowMap: (state) => {
      return state.workflowMap;
    },
    getWorkflowFormula: (state) => state.workflowFormula,
  },
  state: {
    container: null,
    currentNode: null,
    reRenderKeep: 0,
    reRender: 0,
    nodes: initNodes(),
    edges: [],
    group: false,
    buCode: "",
    workflowMap: null,
    name: "",
    productType: "",
    sort: "100",
    picUrlChange: "",
    description: "",
    level: "-1",
    workflowFormula: "",
    isUpdate: false,
    changeGo: false,
  },
  mutations: {
    setChangeGo(state, changeGo) {
      state.changeGo = changeGo;
    },
    setUpdate(state, update) {
      state.isUpdate = update;
    },
    setCurrentNode(state, currentNode) {
      state.currentNode = currentNode;
    },
    addOwner(state, owners) {
      state.currentNode.owners = owners;
    },
    setNodeList(state, nodesList) {
      state.nodesList = nodesList;
    },
    addNode(state, node) {
      state.nodes.push(node);
    },
    addEdge(state, edge) {
      state.edges.push(edge);
    },
    setNodes(state, nodes) {
      state.nodes = nodes;
    },
    setEdges(state, edges) {
      state.edges = edges;
    },
    setContainer(state, container) {
      state.container = container;
    },
    reRending(state) {
      state.reRender++;
    },
    reRendingKeep(state) {
      state.reRenderKeep++;
    },
    initData(state) {
      state.nodes = initNodes();
      state.edges = [];
      state.buCode = "";
      state.group = false;
      state.name = "";
      state.productType = "";
      state.sort = "100";
      state.picUrl = "";
      state.description = "";
      state.currentNode = null;
      state.workflowFormula = "";
      state.changeGo = false;
    },
    buCodeChange(state, buCode) {
      state.buCode = buCode;
    },
    goCodeChange(state, group) {
      state.group = group;
      state.changeGo = true;
    },
    nameChange(state, name) {
      state.name = name;
    },
    productTypeChange(state, productType) {
      state.productType = productType;
    },
    sortChange(state, sort) {
      state.sort = sort;
    },
    picUrlChange(state, picUrl) {
      state.picUrl = picUrl;
    },
    descriptionChange(state, description) {
      state.description = description;
    },
    workflowFormulaChange(state, workflowFormula) {
      state.workflowFormula = workflowFormula;
    },
    levelChange(state, level) {
      state.level = level;
    },
    transformWorflowObj(state) {
      const getOwner = (arr) => {
        let temp = [];
        arr.forEach((item) => {
          item.children.forEach((owner) => {
            temp.push(owner.key);
          });
        });

        return temp;
      }; // const dfsToObj = (root = '0') => { //   let temp = [] //   const parallelNodeId = state.edges //     .filter(edge => edge.source == root) //     .map(item => item.target) //   for (let i = 0; i < parallelNodeId.length; i++) { //     const curNodeId = parallelNodeId[i] //     temp.push(createHandleNode(curNodeId)) //   } //   return temp // } // const createHandleNode = id => { //   let nodeObj = state.nodes.find(item => item.id == id) //   if (state.edges.filter(item => item.source == id).length == 0) { //     return { //       handleNode: { //         id: nodeObj.id, //         userIdList: getOwner(nodeObj.owners) //       } //     } //   } else if (state.edges.filter(item => item.source == id).length == 1) { //     return createSerialNode(id) //   } // } // const createSerialNode = id => { //   let temp = { serialNode: [] } //   let currNode = state.nodes.find(item => item.id == id) //   do { //     temp.serialNode.push({ //       handleNode: { //         id: currNode.id, //         userIdList: getOwner(currNode.owners) //       } //     }) //     let nextArr = state.edges.filter(item => item.source == currNode.id) //     if (nextArr.length == 1) { //       currNode = state.nodes.find(item => item.id == nextArr[0].target) //     } else if (nextArr.length == 2) { //       temp.serialNode.push(createParallelNode(currNode.id)) //       currNode = null //     } else { //       currNode = null //     } //   } while (currNode) //   return temp // } // const createParallelNode = id => { //   let temp = { //     parallelNode: [] //   } //   let ids = state.edges.filter(item => item.source == id) //   ids.forEach(i => { //     temp.parallelNode.push(createSerialNode(i.target)) //   }) //   return temp // }
      let data = {
        parallelNode: [],
      };

      const traverseNodes = () => {
        let currentArr = data.parallelNode;
        const getNodesType = () => {
          let dic = {};
          for (let i = 0; i < state.nodes.length; i++) {
            let node = state.nodes[i];
            let [targets, sources] = getAround(node.id);
            dic[node.id] = {
              target: targets.length,
              source: sources.length,
            };
          }

          let types = Object.values(dic);
          console.log(types);
          let type = "A";
          for (let i = 1; i < types.length; i++) {
            let num = types[i]; //   console.log(num);
            if (num.target >= 2 || num.source >= 2) {
              type = "B";
            }
          }
          return type;
        };
        const getAround = (id) => {
          let subTargets = state.edges.filter((edge) => id === edge.target);
          let subSources = state.edges.filter((edge) => id === edge.source);
          return [subTargets, subSources];
        };
        const result = getNodesType();
        const getNode = (id) => {
          let node = state.nodes.find((item) => id == item.id);
          state.nodes = state.nodes.filter((item) => item.id != id);
          return node;
        };
        const IsSignNode = (id) => {
          let subSources = state.edges.filter((edge) => id === edge.source);
          let subTargets = state.edges.filter(
            (edge) => edge.target == subSources[0]?.source
          );

          return (
            (subSources.length == 1 || subSources.length == 0) &&
            (subTargets.length == 1 || subTargets.length == 0)
          );
        };
        const nextNodeIsSignNode = (id) => {
          let sources = state.edges.filter((edge) => id === edge.source);
          let targets = state.edges.filter((edge) => id === edge.target);
          if (
            sources.length == 1 &&
            (targets.length == 0 || targets.length == 1)
          ) {
            return [IsSignNode(sources[0].target), sources[0].target];
          }
          return [false, null];
        };
        const getNextNode = (id) => {
          let sources = state.edges.filter((edge) => id === edge.source);
          if (sources.length == 1) {
            return sources[0].target;
          }
          return null;
        };
        const traverseNodesByTypeA = () => {
          while (state.nodes.length) {
            let currentNode = state.nodes.shift();
            let sources = state.edges.filter(
              (edge) => currentNode.id === edge.source
            );
            let targets = state.edges.filter(
              (edge) => currentNode.id === edge.target
            );
            if (sources.length > 0 && targets.length == 0) {
              for (let i = 0; i < sources.length; i++) {
                let source = sources[i];
                let isSignNode = IsSignNode(source.target);

                if (isSignNode) {
                  let node = getNode(source.target);
                  let curr = {};
                  curr.serialNode = [];
                  curr.serialNode.push({
                    handleNode: {
                      nodeid: node.id,
                      id: node.id,
                      userIdList: getOwner(node.owners),
                    },
                  });
                  let [nextSign, nextNode] = nextNodeIsSignNode(node.id);
                  while (nextSign) {
                    console.log(nextSign, nextNode);
                    debugger;
                    if (IsSignNode(nextNode)) {
                      node = getNode(nextNode);
                      if (node) {
                        curr.serialNode.push({
                          handleNode: {
                            nodeid: node.id,
                            id: node.id,
                            userIdList: getOwner(node.owners),
                          },
                        });
                        [nextSign, nextNode] = nextNodeIsSignNode(node.id);
                      }
                    }
                  }
                  currentArr.push(curr);
                }
              }
            }
          }
        };

        const traverseNodesByTypeB = () => {
          while (state.nodes.length) {
            let currentNode = state.nodes.shift();
            let sources = state.edges.filter(
              (edge) => currentNode.id === edge.source
            );
            let targets = state.edges.filter(
              (edge) => currentNode.id === edge.target
            );
            if (sources.length > 0 && targets.length == 0) {
              for (let i = 0; i < sources.length; i++) {
                let source = sources[i];
                let isSignNode = IsSignNode(source.target);

                if (isSignNode) {
                  let node = getNode(source.target);
                  let curr = {};
                  curr.serialNode = [];
                  curr.serialNode.push({
                    handleNode: {
                      nodeid: node.id,
                      id: node.id,
                      userIdList: getOwner(node.owners),
                    },
                  });
                  let [nextSign, nextNode] = nextNodeIsSignNode(node.id);
                  while (nextSign) {
                    console.log(nextSign, nextNode);
                    debugger;
                    if (IsSignNode(nextNode)) {
                      node = getNode(nextNode);
                      if (node) {
                        curr.serialNode.push({
                          handleNode: {
                            nodeid: node.id,
                            id: node.id,
                            userIdList: getOwner(node.owners),
                          },
                        });
                        [nextSign, nextNode] = nextNodeIsSignNode(node.id);
                      } else {
                        nextSign = false;
                      }
                    }
                  }
                  currentArr.push(curr);
                }
              }
            } //   console.log( //     "剩余数量:", //     state.nodes.length, //     ",来源:", //     sources.length, //     ",目标:", //     targets.length, //     currentNode //   );
            if (sources.length >= 2) {
              let arr = {
                parallelNode: [],
              };
              let ser = {
                serialNode: [],
              };
              ser.serialNode.push({
                handleNode: {
                  nodeid: currentNode.id,
                  id: currentNode.id,
                  userIdList: getOwner(currentNode.owners),
                },
              });
              arr.parallelNode.push(ser);
              currentArr.push(arr);
              currentArr = arr.parallelNode;
            }
            if (sources.length == 1 && targets.length == 1) {
              let curr = {};
              curr.serialNode = [];
              curr.serialNode.push({
                handleNode: {
                  nodeid: currentNode.id,
                  id: currentNode.id,
                  userIdList: getOwner(currentNode.owners),
                },
              });
              let nextNode = getNextNode(currentNode.id);
              let [flag, nextNodeId] = nextNodeIsSignNode(nextNode);
              while (flag) {
                currentNode = getNode(nextNode);
                curr.serialNode.push({
                  handleNode: {
                    nodeid: currentNode.id,
                    id: currentNode.id,
                    userIdList: getOwner(currentNode.owners),
                  },
                });
                nextNode = getNextNode(currentNode.id);
                [flag, nextNodeId] = nextNodeIsSignNode(nextNode);
              }
              currentArr.push(curr);
            }
            if (targets.length >= 2) {
              let arr = {
                parallelNode: [],
              };
              let ser = {
                serialNode: [],
              };
              ser.serialNode.push({
                handleNode: {
                  nodeid: currentNode.id,
                  id: currentNode.id,
                  userIdList: getOwner(currentNode.owners),
                },
              });
              arr.parallelNode.push(ser);
              currentArr.push(arr);
              currentArr = arr.parallelNode;
            }
          }
        };
        console.log(result);

        if (result == "A") {
          traverseNodesByTypeA();
        }
        if (result == "B") {
          traverseNodesByTypeB();
        }
      };
      traverseNodes(); // debugger // data.forEach(item => { //   if (item.parallelNode) { //     item.forEach(it => { //       if (it.serialNode) { //         it.forEach(i => { //           console.log(i, '所有handle节点') //         }) //       } //     }) //   } // })
      state.workflowMap = data; // const nodelist = store.getters['workflow/getNodeList']

      let str = JSON.stringify(state.workflowMap);
      str = str.split(/[(\r\n\s)\r\n\s]+/).join("");
      state.workflowFormula = window.btoa(str);
    },
    transformNodesList(state, data) {
      // debugger;
      // console.log('这里会触发吗？？？？')
      state.nodes = initNodes();
      state.edges = [];
      const getDecode = (str) => {
        let decode = window.atob(str);
        return decode;
      };
      let obj = JSON.parse(getDecode(state.workflowFormula)); // console.log(obj, '《《《这里是什么呀？？？？')
      const getOwners = (arr) => {
        let owners = [];
        let temp = {};
        arr.forEach((item) => {
          let objData = data.userInfoList.find((user) => user.id === item);
          if (objData && !temp[objData.org]) {
            temp[objData.org] = [];
          }
          if (objData) {
            temp[objData.org].push({
              title: objData.nickname,
              key: objData.id,
            });
          }
        });
        for (let key in temp) {
          let arr = temp[key];
          owners.push({
            title: key,
            children: arr,
          });
        }
        return owners;
      };
      const convert = (data) => {
        const traverse = (data, parentId) => {
          data.forEach((subData, index) => {
            let pid = parentId;
            if (subData.serialNode) {
              subData.serialNode.forEach((item) => {
                let id = item.handleNode.id;
                state.nodes.push({
                  id,
                  lable: id,
                  owners: getOwners(item.handleNode.userIdList),
                });
                debugger;
                state.edges.push({ source: pid, target: id });
                pid = id;
              });
            }
            if (subData.parallelNode) {
              let target = subData.parallelNode[0].serialNode[0].handleNode.id;
              if (index >= 1) {
                for (let i = index - 1; i <= index; i++) {
                  if (data[index - i].serialNode) {
                    let source = data[index - i].serialNode[0].handleNode.id;
                    state.edges.push({ source, target });
                  }
                }
              }
              traverse(subData.parallelNode, target);
            }
          });
        };
        traverse(data, "0"); // console.log(state.nodes,'33333333333333333333')
        state.edges = state.edges.filter((item) => item.target != item.source);
      };
      convert(obj.parallelNode); // console.log('-----------', obj)
    },
  },
  actions: {
    setCurrentNode({ commit }, currentNode) {
      commit("setCurrentNode", currentNode);
    },
    addOwner({ commit }, owners) {
      commit("addOwner", owners);
    },
    addNode({ commit }, node) {
      commit("addNode", node);
    },
    addEdge({ commit }, edge) {
      commit("addEdge", edge);
    },
    setNodeList({ commit }, nodesList) {
      commit("setNodeList", nodesList);
    },
    workflowInit({ commit }) {
      commit("setNodeList", {
        nodes: [],
        edges: [],
      });
    },
  },
};
