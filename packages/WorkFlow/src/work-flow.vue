<template>
  <div class="test">
    <div v-if="!opt.readonly" class="controllerBtn">
      <slot name="controllerBtn">
        <button @click="create" type="primary"><subnode-outlined /></button>
        <button @click="createParallelNode" type="primary">
          <share-alt-outlined />
        </button>

        <button @click="mergeNode" type="primary">
          <NodeExpandOutlined />
        </button>
        <button @click="remove" type="primary"><delete-row-outlined /></button>
        <button @click="transformWorflowNodeToObj" type="primary">转换</button>
        <button @click="transformWorflowObjToNode" type="primary">转换2</button>
      </slot>
    </div>
    <div ref="container" id="container"></div>
  </div>
</template>

<script setup name="WorkFlowMap">
import {
  SubnodeOutlined,
  ShareAltOutlined,
  NodeExpandOutlined,
  DeleteRowOutlined,
} from "@ant-design/icons-vue";
import G6 from "@antv/g6";
import { onMounted, reactive, watch, defineProps, ref } from "vue";
const props = defineProps({
  readonly: {
    type: Boolean,
    default: undefined,
  },
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 380,
  },
  workflowFormula: {
    type: String,
    default: "",
  },
});
const nodes = ref([{ id: "0", label: "Start" }]);
const edges = ref([]);
const currentNode = ref(null);
const container = ref(null);
const workflowFormula = ref("");
const { width, height, readonly } = reactive(props);
const typeDefaultUndefined = (value) => {
  return typeof value != "undefined";
};
const opt = {
  readonly: typeDefaultUndefined(readonly),
};

const fittingString = (str, maxWidth, fontSize) => {
  const ellipsis = "...";
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
  let currentWidth = 0;
  let res = str;
  const pattern = new RegExp("[\u4E00-\u9FA5]+"); // distinguish the Chinese charactors and letters
  str.split("").forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength) return;
    if (pattern.test(letter)) {
      // Chinese charactors
      currentWidth += fontSize;
    } else {
      // get the width of single letter according to the fontSize
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (currentWidth > maxWidth - ellipsisLength) {
      res = `${str.substr(0, i)}${ellipsis}`;
    }
  });
  return res;
};

const modes = ["drag-canvas", "zoom-canvas"];
if (!opt.readonly) {
  modes.push("click-select");
}

onMounted(() => {
  init();
});

// const getNodeList = () => {};
const init = () => {
  const graph = new G6.Graph({
    container: "container",
    width: width,
    height: height,
    fitCenter: true,
    fitView: true,
    modes: {
      default: [
        ...modes,
        {
          type: "tooltip",
          formatText(model) {
            const owners = model.owners ?? [];
            const text = [];
            owners.forEach((row) => {
              row.children.forEach((item) => {
                text.push(item.title + ", " + row.title + "<br />");
              });
            });

            return text.join("\n");
          },
          offset: 30,
          textAlign: "left",
        },
      ],
    },
    layout: {
      type: "dagre",
      rankdir: "LR",
      controlPoints: true,
      nodesepFunc: () => 30,
      ranksepFunc: () => 30,
    },
    nodeStateStyles: {
      hover: {
        stroke: "#1890ff",
        lineWidth: 4,
      },
      selected: {
        fill: "#F3BB90",
        stroke: "#e87722",
        shadowColor: "#e87722",
        "text-shape": {
          fill: "#ffffff",
        },
      },
    },
    defaultNode: {
      type: "rect",
      size: [180, 60],
      style: {
        lineWidth: 2,
        stroke: "#F3BB90",
        fill: "#e87722",
        radius: 8,
      },
      labelCfg: {
        style: {
          fill: "#fff",
          fontSize: 12,
          textAlign: "left",
          textBaseline: "middle", // fontWeight: 'bold',
        },
        position: "left",
        offset: -8,
      },
    },
    defaultEdge: {
      type: "polyline",
      size: 3,
      color: "#DBDFE1",
      style: {
        endArrow: true, // startArrow: true,
        radius: 20,
      },
    },
  });
  container.value = graph;

  graph.node((el) => {
    if (el.state == "pending") {
      return {
        stateStyles: {
          selected: {
            fill: "#FEE8A0",
            stroke: "#FED141",
            shadowColor: "#7FCBD4",
          },
        },
        style: {
          fill: "#FED141",
          stroke: "#FEE8A0",
        },
      };
    }
    if (el.state == "rejected") {
      return {
        stateStyles: {
          selected: {
            fill: "#FF6347",
            stroke: "#FF4500",
            shadowColor: "#FF6347",
          },
        },
        style: {
          fill: "#FF4500",
          stroke: "#FF6347",
        },
      };
    }
    if (el.state == "approved") {
      return {
        stateStyles: {
          selected: {
            stroke: "#e87722",
            fill: "#F3BB90",
            shadowColor: "#e87722",
          },
        },
        style: {
          fill: "#e87722",
          stroke: "#F3BB90",
        },
      };
    }
    return {
      stateStyles: {
        selected: {
          stroke: "#e87722",
          fill: "#FFFFFF",
          shadowColor: "#e87722",
          "text-shape": {
            fill: "#e87722",
          },
        },
      },
      style: {
        stroke: "#e87722",
        fill: "#FFFFFF",
      },
      labelCfg: {
        style: {
          fill: "#e87722",
          fontSize: 10,
          textAlign: "left",
          textBaseline: "middle",
        },
        position: "left",
        offset: -12,
      },
    };
  });
  graph.data({ nodes: nodes.value, edges: edges.value });
  graph.render();
  graph.on("node:click", (e) => {
    const model = e.item.getModel();
    currentNode.value = model;
  });
};

const getId = () => {
  return `${new Date().getTime()}`;
};

const renderNode = (keepCurrentNode = false) => {
  if (!keepCurrentNode) {
    currentNode.value = null;
  } else {
    nodes.value.forEach((item) => {
      if (item.id === node.id) {
        item.ishas = true;
        if (item.id !== "0") {
          let names = [];
          let num = 1;
          if (currentNode.value.owners) {
            currentNode.value.owners.forEach((group) => {
              group.children.forEach((owner) => {
                names.push(fittingString(`${num}.${owner.title}`, 230, 14));
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
          }
        }
      }
    });
  }
  container.value.data({ nodes: nodes.value, edges: edges.value });
  container.value.render();
};
const collectChildrenNodes = (id) => {
  let arr = [];
  let result = edges.value
    .filter((item) => item.source == id)
    .map((item) => item.target);
  if (result.length > 0) {
    result.forEach((item) => {
      let res = collectChildrenNodes(item);
      arr.push(...res);
    });
  }

  return arr.concat(result);
};

const remove = () => {
  if (!currentNode.value) {
    return;
  }
  if (currentNode.value.id == "0") {
    nodes.value = [
      {
        id: "0",
        label: "Start",
        state: "",
      },
    ];
    edges.value = [];
    renderNode();
    return;
  }
  let removeNodes = collectChildrenNodes(currentNode.value.id);
  removeNodes.push(currentNode.value.id);
  let newNodes = nodes.value.filter((item) => !removeNodes.includes(item.id));
  let newEdges = edges.value.filter(
    (item) =>
      !(removeNodes.includes(item.source) || removeNodes.includes(item.target))
  );
  nodes.value = newNodes;
  edges.value = newEdges;
  renderNode();
};

const create = () => {
  if (!currentNode.value) {
    return;
  }
  let node = createNode();
  nodes.value.push(node);
  let edge = edges.value.find((item) => item.source == currentNode.value.id);
  let index = edges.value.findIndex(
    (item) => item.source == currentNode.value.id
  );
  let target = edge?.target;
  edges.value.forEach((item) => {
    if (item.target == target) {
      item.target = node.id;
    }
  });
  let newEdge = {
    source: currentNode.value.id,
    target: target,
  };
  if (!target) {
    newEdge.source = currentNode.value.id;
    newEdge.target = node.id;
    edges.value.push(newEdge);
  } else {
    let newEdges = edges.value.slice(0);
    newEdges.splice(index, 0, newEdge);
    edges.value = newEdges;
  }
  renderNode();
};
const createNode = () => {
  let id = getId();
  return {
    id: id,
    label: id,
    owners: [],
    style: {},
    state: "",
  };
};
const createParallelNode = () => {
  let node = createNode();
  nodes.value.push(node);
  edges.value.push({
    source: "0",
    target: node.id,
  });
  renderNode();
};
const mergeNode = () => {
  const selectNodes = container.value.findAllByState("node", "selected");
  if (selectNodes.length < 2) {
    return;
  }

  let newEdges = [];
  let newNode = createNode();
  let flag = true;
  selectNodes.forEach((node) => {
    const model = node.getModel();
    newEdges.push({
      source: model.id,
      target: newNode.id,
    });
    if (flag) {
      flag = edges.value.every((item) => item.source != model.id);
    }
  });
  if (flag) {
    nodes.value.push(newNode);
    edges.value = edges.value.concat(newEdges);
    renderNode();
  }
};

const transformWorflowNodeToObj = () => {
  const getOwner = (arr) => {
    if (!arr) {
      return "";
    }
    let temp = [];
    arr.forEach((item) => {
      item.children.forEach((owner) => {
        temp.push(owner.key);
      });
    });

    return temp;
  };
  let data = {
    parallelNode: [],
  };
  let non_nodes = JSON.parse(JSON.stringify(nodes.value));
  const traverseNodes = () => {
    let currentArr = data.parallelNode;
    const getNodesType = () => {
      let dic = {};
      for (let i = 0; i < non_nodes.length; i++) {
        let node = non_nodes[i];
        let [targets, sources] = getAround(node.id);
        dic[node.id] = {
          target: targets.length,
          source: sources.length,
        };
      }

      let types = Object.values(dic);
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
      let subTargets = edges.value.filter((edge) => id === edge.target);
      let subSources = edges.value.filter((edge) => id === edge.source);
      return [subTargets, subSources];
    };
    const result = getNodesType();
    const getNode = (id) => {
      let node = non_nodes.find((item) => id == item.id);
      non_nodes = non_nodes.filter((item) => item.id != id);
      return node;
    };
    const IsSignNode = (id) => {
      if (!id) {
        return false;
      }
      let subSources = edges.value.filter((edge) => id === edge.source);
      let subTargets = edges.value.filter((edge) => edge.target == id);
      return (
        (subSources.length == 1 || subSources.length == 0) &&
        (subTargets.length == 1 || subTargets.length == 0)
      );
    };
    const nextNodeIsSignNode = (id) => {
      if (!id) {
        [false, null];
      }
      let sources = edges.value.filter((edge) => id === edge.source);
      let targets = edges.value.filter((edge) => id === edge.target);
      if (sources.length == 1 && (targets.length == 0 || targets.length == 1)) {
        return [IsSignNode(sources[0].target), sources[0].target];
      }
      return [false, null];
    };
    const traverseNodesByTypeA = () => {
      while (non_nodes.length) {
        let currentNode = non_nodes.shift();
        let sources = edges.value.filter(
          (edge) => currentNode.id === edge.source
        );
        let targets = edges.value.filter(
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
                if (IsSignNode(nextNode)) {
                  node = getNode(nextNode);

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
              currentArr.push(curr);
            }
          }
        }
      }
    };

    const traverseNodesByTypeB = () => {
      while (non_nodes.length) {
        let currentNode = non_nodes.shift();
        let sources = edges.value.filter(
          (edge) => currentNode.id === edge.source
        );
        let targets = edges.value.filter(
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
              while (IsSignNode(nextNode)) {
                node = getNode(nextNode);
                if (node) {
                  curr.serialNode.push({
                    handleNode: {
                      nodeid: node.id,
                      id: node.id,
                      userIdList: getOwner(node.owners),
                    },
                  });
                }

                [nextSign, nextNode] = nextNodeIsSignNode(node?.id);
              }
              // console.log(nextNode);
              // console.log(IsSignNode(nextNode));
              // console.log(nextNode);
              // while (nextSign) {
              //   if (IsSignNode(nextNode)) {
              //     node = getNode(nextNode);
              //     if (node) {
              //       curr.serialNode.push({
              //         handleNode: {
              //           nodeid: node.id,
              //           id: node.id,
              //           userIdList: getOwner(node.owners),
              //         },
              //       });
              //       [nextSign, nextNode] = nextNodeIsSignNode(node.id);
              //     }
              //   }
              // }
              currentArr.push(curr);
            }
          }
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
    console.log(edges.value);
    console.log(result);

    if (result == "A") {
      traverseNodesByTypeA();
    }
    if (result == "B") {
      traverseNodesByTypeB();
    }
  };
  traverseNodes();
  console.log(data);
  let str = JSON.stringify(data);
  str = str.split(/[(\r\n\s)\r\n\s]+/).join("");
  workflowFormula.value = window.btoa(str);
  console.log(workflowFormula.value);
  nodes.value = [];
  edges.value = [];
  renderNode();
};

const transformWorflowObjToNode = () => {
  const getDecode = (str) => {
    let decode = window.atob(str);
    return decode;
  };
  let obj = JSON.parse(getDecode(workflowFormula.value));
  // console.log(obj);
  nodes.value = [{ id: "0", label: "Start" }];
  edges.value = [];
  const getOwners = (arr) => {
    let owners = [];
    let temp = {};
    if (!arr) {
      return [];
    }
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
            nodes.value.push({
              id,
              nodeid: id,
              label: id,
              owners: getOwners(item.handleNode.userIdList),
            });
            edges.value.push({ source: pid, target: id });
            pid = id;
          });
        }
        if (subData.parallelNode) {
          let target = subData.parallelNode[0].serialNode[0].handleNode.id;
          if (index >= 1) {
            for (let i = index - 1; i <= index; i++) {
              if (data[index - i].serialNode) {
                let source = data[index - i].serialNode[0].handleNode.id;
                edges.value.push({ source, target });
              }
            }
          }
          traverse(subData.parallelNode, target);
        }
      });
    };
    traverse(data, "0");
    edges.value = edges.value.filter((item) => item.target != item.source);
  };

  convert(obj.parallelNode);
  renderNode();
};
</script>

<style scoped>
.g6-tooltip {
  border-radius: 8px;
  font-size: 12px;
  color: #fff;
  background-color: #000;
  padding: 2px 8px;
  text-align: center;
  text-align: left;
}
/* .test {
 position: absolute;
 width: 800px;
 height: 800px;
 left: 200px;
 top: 50px;
 background-color: #0094ff;
 z-index: 100;
} */
#container {
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}
.controllerBtn {
  display: flex;
  line-height: 80px;
  height: 60px;
  border-top: 1px solid #d9d9d9;
  border-left: 1px solid #d9d9d9;
  border-right: 1px solid #d9d9d9;
}

.controllerBtn .ant-btn {
  margin-top: 10px;
  margin: 14px 10px;
}
</style>
