"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExtractionField } from "@/types/pdf-parser-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Save, X, FileText, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  saveTemplate,
  loadTemplates,
  deleteTemplate
} from "@/lib/template-management"

const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  description: z.string().min(1, "Description is required")
})

interface FieldsTabProps {
  fields: ExtractionField[]
  onFieldsChange: (fields: ExtractionField[]) => void
}

export default function FieldsTab({ fields, onFieldsChange }: FieldsTabProps) {
  const [templates, setTemplates] = useState<
    { name: string; fields: ExtractionField[] }[]
  >([])
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  })

  // Load templates when component mounts
  useEffect(() => {
    const loadedTemplates = loadTemplates()
    setTemplates(loadedTemplates)
  }, [])

  const onSubmit = (values: z.infer<typeof fieldSchema>) => {
    const newField: ExtractionField = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description
    }

    onFieldsChange([...fields, newField])
    form.reset()
  }

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id))
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim() || fields.length === 0) {
      toast({
        title: "Cannot save template",
        description: "Please provide a template name and at least one field.",
        variant: "destructive"
      })
      return
    }

    saveTemplate(templateName, fields)

    // Refresh templates
    const updatedTemplates = loadTemplates()
    setTemplates(updatedTemplates)

    toast({
      title: "Template saved",
      description: "Your field template has been saved successfully."
    })

    setSaveModalOpen(false)
    setTemplateName("")
  }

  const handleLoadTemplate = (templateName: string) => {
    const template = templates.find(t => t.name === templateName)
    if (template) {
      onFieldsChange(template.fields)
      toast({
        title: "Template loaded",
        description: `Template "${templateName}" has been loaded with ${template.fields.length} fields.`
      })
    }
  }

  const handleDeleteTemplate = (templateName: string) => {
    deleteTemplate(templateName)

    // Refresh templates
    const updatedTemplates = loadTemplates()
    setTemplates(updatedTemplates)

    toast({
      title: "Template deleted",
      description: `Template "${templateName}" has been deleted.`
    })
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Fields to Extract</h3>
        <div className="flex gap-2">
          {templates.length > 0 && (
            <Select onValueChange={handleLoadTemplate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Load template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.name} value={template.name}>
                    <div className="flex w-full items-center justify-between">
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setSaveModalOpen(true)}
            disabled={fields.length === 0}
          >
            <Save className="size-4" />
            Save Template
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Full Name, Email, Phone Number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description/Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what to extract. E.g. 'Extract the full name from the resume header'"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="flex items-center gap-1">
            <PlusCircle className="size-4" />
            Add Field
          </Button>
        </form>
      </Form>

      {fields.length > 0 ? (
        <div className="mt-6 space-y-3">
          {fields.map(field => (
            <Card key={field.id}>
              <div className="flex justify-between p-4">
                <div>
                  <h4 className="font-medium">{field.name}</h4>
                  <p className="text-sm text-gray-500">{field.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(field.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-gray-50">
          <CardHeader>
            <CardTitle className="text-center">No Fields Added</CardTitle>
            <CardDescription className="text-center">
              Add fields to specify what data should be extracted from your PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <FileText className="size-24 text-gray-300" />
          </CardContent>
        </Card>
      )}

      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Field Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Resume Template, Invoice Fields"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                />
              </FormControl>
            </FormItem>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Template will contain {fields.length} fields:
              </h4>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {fields.map(field => (
                  <div key={field.id} className="rounded border p-2 text-sm">
                    {field.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {templates.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-medium">Saved Templates</h3>
          <div className="space-y-2">
            {templates.map(template => (
              <Card key={template.name} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-500">
                      {template.fields.length} fields
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTemplate(template.name)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.name)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
