import React from 'react';

const Playground: React.FC = () => {

  async function addSharedNode() {
    const data = await fetch('/api/nodes/invite', {
      method: 'POST',
      body: JSON.stringify({
        nodeId: ''
      })
    })
    const json = await data.json();
    console.log(json);
  }

  return (
    <div>
      <button onClick={async () => await addSharedNode()}>Add shared node</button>
    </div>
  );
};

export default Playground;