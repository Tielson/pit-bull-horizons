import { useState, useEffect } from "react"

const TOAST_LIMIT = 1

let count = 0
function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastStore = {
  state: {
    toasts: [],
  },
  listeners: [],
  
  getState: () => {
    const state = toastStore.state
    return state && typeof state === 'object' && Array.isArray(state.toasts) 
      ? state 
      : { toasts: [] }
  },
  
  setState: (nextState) => {
    let newState
    if (typeof nextState === 'function') {
      const currentState = toastStore.state || { toasts: [] }
      newState = nextState(currentState)
    } else {
      const currentState = toastStore.state || { toasts: [] }
      newState = { ...currentState, ...nextState }
    }
    
    // Garantir que toasts seja sempre um array
    if (!newState || !Array.isArray(newState.toasts)) {
      newState = { toasts: [] }
    }
    
    toastStore.state = newState
    toastStore.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(toastStore.state)
      }
    })
  },
  
  subscribe: (listener) => {
    if (typeof listener !== 'function') {
      return () => {}
    }
    
    toastStore.listeners.push(listener)
    return () => {
      toastStore.listeners = toastStore.listeners.filter(l => l !== listener)
    }
  }
}

export const toast = ({ ...props }) => {
  const id = generateId()

  const update = (props) =>
    toastStore.setState((state) => {
      const currentState = state || { toasts: [] }
      const currentToasts = Array.isArray(currentState.toasts) ? currentState.toasts : []
      return {
        ...currentState,
        toasts: currentToasts.map((t) =>
          t.id === id ? { ...t, ...props } : t
        ),
      }
    })

  const dismiss = () => toastStore.setState((state) => {
    const currentState = state || { toasts: [] }
    const currentToasts = Array.isArray(currentState.toasts) ? currentState.toasts : []
    return {
      ...currentState,
      toasts: currentToasts.filter((t) => t.id !== id),
    }
  })

  toastStore.setState((state) => {
    const currentState = state || { toasts: [] }
    const currentToasts = Array.isArray(currentState.toasts) ? currentState.toasts : []
    return {
      ...currentState,
      toasts: [
        { ...props, id, dismiss },
        ...currentToasts,
      ].slice(0, TOAST_LIMIT),
    }
  })

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const initialState = toastStore.getState() || { toasts: [] }
  const [state, setState] = useState(initialState)
  
  useEffect(() => {
    const unsubscribe = toastStore.subscribe((newState) => {
      setState(newState && typeof newState === 'object' ? newState : { toasts: [] })
    })
    
    return unsubscribe
  }, [])
  
  useEffect(() => {
    if (!state || !Array.isArray(state.toasts)) {
      return
    }

    const timeouts = []

    state.toasts.forEach((toast) => {
      if (!toast || toast.duration === Infinity) {
        return
      }

      const timeout = setTimeout(() => {
        if (toast && typeof toast.dismiss === 'function') {
          toast.dismiss()
        }
      }, toast.duration || 5000)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach((timeout) => {
        if (timeout) {
          clearTimeout(timeout)
        }
      })
    }
  }, [state?.toasts])

  const toasts = (state && Array.isArray(state.toasts)) ? state.toasts : []

  return {
    toast,
    toasts,
  }
}