'use client';

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function TodosPage() {
  const [todos, setTodos] = useState<any[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select()

      if (todos) {
        setTodos(todos)
      }
    }

    getTodos()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Todo List (Supabase Test)</h1>
      <ul className="list-disc pl-5">
        {todos.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
      {todos.length === 0 && <p className="text-gray-500">No todos found or "todos" table does not exist in the new project.</p>}
    </div>
  )
}
