import React from 'react';
import {NodesInterface} from "./RootNode";

interface Props {
  id: string;
  nodes: NodesInterface;
}

const SharedNode: React.FC<Props> = ({
  id ,
  nodes,
}) => {
  return (
    <li
      key={id}
      className={'ml-10 relative'}
      data-id={id}
    >
      <p>{nodes[id].value}</p>
      <ul>
        {nodes[id].children.map((child) => {
          return (
            <SharedNode id={child} nodes={nodes}/>
          )
        })}
      </ul>
    </li>
  );
};

export default SharedNode;