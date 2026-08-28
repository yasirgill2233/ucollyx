import { useState } from 'react'

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
  try {
    // Check krain agar value function hai (jaise setToken(prev => ...))
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  } catch (error) {
    console.log(error);
  }
};

  return [storedValue, setValue]
}

export default useLocalStorage
// Use: const [token, setToken] = useLocalStorage('token', null)