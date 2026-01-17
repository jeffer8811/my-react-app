import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h2>Contador</h2>
      <button onClick={() => setCount(count + 1)}>
        Clicks: {count}
      </button>
    </>
  )
}

export default Counter
