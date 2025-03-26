"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import TasksList from "./_components/task-list"
import { Task } from "@/types/pdf-parser-types"
import TaskCreationModal from "./_components/task-creation-modal"
import { loadTasks } from "@/lib/task-management"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = loadTasks()
    setTasks(storedTasks)
  }, [])

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  const refreshTasks = () => {
    const storedTasks = loadTasks()
    setTasks(storedTasks)
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">PDF Parser Dashboard</h1>
        <Button onClick={toggleModal} className="flex items-center gap-2">
          <PlusCircle className="size-5" />
          New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksList tasks={tasks} onTaskDeleted={refreshTasks} />
        </CardContent>
      </Card>

      {isModalOpen && (
        <TaskCreationModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          onTaskCreated={refreshTasks}
        />
      )}
    </div>
  )
}
