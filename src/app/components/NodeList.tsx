import * as React from "react";
import { motion } from "framer-motion";
import ListItem from "./ListItem";
import TotalErrorCount from "./TotalErrorCount";
import SettingsPanel from "./SettingsPanel";
import "../styles/bottom-controls.css";

function NodeList(props) {
  const [panelVisible, setPanelVisible] = React.useState(false);

  // Reduce the size of our array of errors by removing
  // nodes with no errors on them.
  let filteredErrorArray = props.errorArray.filter(
    item => item.errors.length >= 1
  );

  filteredErrorArray.forEach(item => {
    // Check each layer/node to see if an error that matches it's layer id
    if (props.ignoredErrorArray.some(x => x.node.id === item.id)) {
      // When we know a matching error exists loop over all the ignored
      // errors until we find it.
      props.ignoredErrorArray.forEach(ignoredError => {
        if (ignoredError.node.id === item.id) {
          // Loop over every error this layer/node until we find the
          // error that should be ignored, then remove it.
          for (let i = 0; i < item.errors.length; i++) {
            if (item.errors[i].value === ignoredError.value) {
              item.errors.splice(i, 1);
              i--;
            }
          }
        }
      });
    }
  });

  const handleNodeClick = id => {
    // Opens the panel if theres an error.
    let activeId = props.errorArray.find(e => e.id === id);

    if (activeId.errors.length) {
      // Pass the plugin the ID of the layer we want to fetch.
      parent.postMessage(
        { pluginMessage: { type: "fetch-layer-data", id: id } },
        "*"
      );

      props.onErrorUpdate(activeId);

      if (props.visibility === true) {
        props.onVisibleUpdate(false);
      } else {
        props.onVisibleUpdate(true);
      }
    }

    props.onSelectedListUpdate(id);
  };

  const handleOpenFirstError = () => {
    const lastItem = filteredErrorArray[filteredErrorArray.length - 1];
    handleNodeClick(lastItem.id);
  };

  const handlePanelVisible = boolean => {
    setPanelVisible(boolean);
  };

  const handleRefreshSelection = () => {
    props.onRefreshSelection();
  };

  if (props.nodeArray.length) {
    let nodes = props.nodeArray;

    const listItems = nodes.map(node => (
      <ListItem
        ignoredErrorArray={props.ignoredErrorArray}
        activeNodeIds={props.activeNodeIds}
        onClick={handleNodeClick}
        selectedListItems={props.selectedListItems}
        errorArray={filteredErrorArray}
        key={node.id}
        node={node}
      />
    ));

    return (
      <motion.div
        className="flex-wrapper"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <ul className="list">{listItems}</ul>
        <TotalErrorCount errorArray={filteredErrorArray} />
        <div className="bottom-controls-row">
          <div
            className="button button--primary"
            onClick={event => {
              event.stopPropagation();
              handleOpenFirstError();
            }}
          >
            Jump to next error →
          </div>
          <span
            className="button--control"
            onClick={event => {
              event.stopPropagation();
              handleRefreshSelection();
            }}
          >
            <span className="tooltip">Lint a new set of layers</span>
            <img
              className="control-icon"
              src={require("../assets/refresh.svg")}
            />
          </span>
          <span
            className="button--control"
            onClick={event => {
              event.stopPropagation();
              handlePanelVisible(true);
            }}
          >
            <span className="tooltip tooltip--settings">Settings</span>
            <img
              className="control-icon"
              src={require("../assets/settings.svg")}
            />
          </span>
        </div>
        <SettingsPanel
          panelVisible={panelVisible}
          onHandlePanelVisible={handlePanelVisible}
          ignoredErrorArray={props.ignoredErrorArray}
          borderRadiusValues={props.borderRadiusValues}
        />
      </motion.div>
    );
  } else {
    return (
      <React.Fragment>
        <ul className="list"></ul>
        <TotalErrorCount errorArray={filteredErrorArray} />
      </React.Fragment>
    );
  }
}

export default React.memo(NodeList);
