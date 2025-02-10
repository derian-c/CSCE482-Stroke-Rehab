import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then((response) => {
        if(!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='App'>
      <header>
        <h1>Welcome to the vite+React frontend</h1>
        {data ? <p>{data.message}</p> : <p>loading data...</p>}
      </header>
    </div>
  )
}

export default App
