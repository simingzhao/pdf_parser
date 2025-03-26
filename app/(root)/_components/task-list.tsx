"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Task } from "@/types/pdf-parser-types"
import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle2,
  Cpu,
  File,
  FileText,
  Loader2,
  Trash2,
  XCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { deleteTask } from "@/lib/task-management"

interface TasksListProps {
  tasks: Task[]
  onTaskDeleted: () => void
}

export default function TasksList({ tasks, onTaskDeleted }: TasksListProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Function to handle task deletion
  const handleDelete = (taskId: string) => {
    try {
      deleteTask(taskId)
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully"
      })
      onTaskDeleted()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the task",
        variant: "destructive"
      })
    }
  }

  // Function to get the status badge based on the task status
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500" variant="secondary">
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500" variant="secondary">
            Failed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500" variant="secondary">
            Processing
          </Badge>
        )
      case "extraction":
        return (
          <Badge className="bg-purple-500" variant="secondary">
            AI Extraction
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-500" variant="secondary">
            Pending
          </Badge>
        )
    }
  }

  // Function to get the task icon based on the task status
  const getTaskIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-10 text-green-500" />
      case "failed":
        return <XCircle className="size-10 text-red-500" />
      case "processing":
        return <Loader2 className="size-10 animate-spin text-blue-500" />
      case "extraction":
        return <Cpu className="size-10 animate-pulse text-purple-500" />
      default:
        return <FileText className="size-10 text-yellow-500" />
    }
  }

  // Sort tasks by creation date (newest first)
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedTasks.map(task => (
        <Card key={task.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 truncate">
                <CardTitle className="truncate text-lg">
                  {task.fileName}
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true
                  })}
                </CardDescription>
              </div>
              {getStatusBadge(task.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="text-muted-foreground mr-2 size-4" />
                <span className="text-muted-foreground text-sm">
                  {task.fields.length} field
                  {task.fields.length !== 1 ? "s" : ""}
                </span>
              </div>
              {task.status === "completed" && task.results && (
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 size-4 text-green-500" />
                  <span className="text-muted-foreground text-sm">
                    {task.results.length} result
                    {task.results.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2 pt-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => router.push(`/results/${task.id}`)}
            >
              View Results
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(task.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardFooter>

          <div className="absolute -right-4 -top-4">
            {getTaskIcon(task.status)}
          </div>
        </Card>
      ))}
    </div>
  )
}
