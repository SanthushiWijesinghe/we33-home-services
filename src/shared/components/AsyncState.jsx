export function LoadingState({ message = 'Loading…' }) {
  return <div role="status" className="async-state">{message}</div>
}

export function ErrorState({ message, retry }) {
  return <div role="alert" className="async-state"><p>{message}</p>{retry && <button onClick={retry}>Try again</button>}</div>
}
