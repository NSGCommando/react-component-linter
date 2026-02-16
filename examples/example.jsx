// sample.jsx
import React from 'react';

function MyComponent() {
  const [count, setCount] = React.useState(0);

  console.log("This should be flagged!");
  
  return (
    <div class="test-class" onClick={() => console.warn("This too!")}>
      <h1>Count: {count}</h1>
    </div>
  );
}

function header() { // Should trigger PascalCase error
  return (
    <ul>
      {['Home', 'About'].map(item => <li>{item}</li>)} {/* Should trigger Missing Key error */}
    </ul>
  );
}

export default MyComponent;