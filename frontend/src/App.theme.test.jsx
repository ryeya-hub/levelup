// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { freshState, useStore } from './store/useStore.js'

vi.mock('./lib/api.js', async original => ({ ...(await original()), api: vi.fn(() => Promise.resolve({})), beacon: vi.fn() }))
globalThis.IS_REACT_ACT_ENVIRONMENT = true
let host, root, before, osDark, listeners
beforeEach(() => {
  before = useStore.getState()
  osDark = true
  listeners = new Set()
  vi.stubGlobal('matchMedia', query => ({ media: query, matches: query.includes('prefers-color-scheme') && osDark,
    addEventListener: (_, fn) => { if (query.includes('prefers-color-scheme')) listeners.add(fn) },
    removeEventListener: (_, fn) => listeners.delete(fn) }))
  useStore.setState({ S: freshState(), user: null, ready: true, boot: vi.fn() })
  localStorage.setItem('gym_guest', '1')
  window.location.hash = '#/home'
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount()); host.remove()
  useStore.setState(before)
  localStorage.clear(); vi.unstubAllGlobals()
})
it('applies Light on mount, retains fixed choices and responds live to OS changes only in System', async () => {
  await act(async () => root.render(<App />))
  expect(document.documentElement.dataset.theme).toBe('light')
  const choose = async theme => act(async () => useStore.getState().update(s => { s.theme = theme }))
  await choose('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  await choose('system')
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(listeners.size).toBe(1)
  osDark = false
  await act(async () => listeners.forEach(fn => fn()))
  expect(document.documentElement.dataset.theme).toBe('light')
  osDark = true
  await act(async () => listeners.forEach(fn => fn()))
  expect(document.documentElement.dataset.theme).toBe('dark')
  await choose('light')
  expect(listeners.size).toBe(0)
  expect(document.documentElement.dataset.theme).toBe('light')
  await choose('invalid')
  expect(document.documentElement.dataset.theme).toBe('light')
})
