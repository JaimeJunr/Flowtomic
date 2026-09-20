import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Progress,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@flowtomic/ui";

const COMPONENT_CATEGORIES = [
  {
    title: "Actions",
    items: [
      { name: "Button", example: <Button>Botão</Button> },
      { name: "Button outline", example: <Button variant="outline">Outline</Button> },
      { name: "Badge", example: <Badge>Badge</Badge> },
    ],
  },
  {
    title: "Forms",
    items: [
      {
        name: "Input",
        example: <Input placeholder="Digite aqui" className="max-w-[200px]" />,
      },
      {
        name: "Checkbox",
        example: (
          <div className="flex items-center gap-2">
            <Checkbox id="demo" />
            <Label htmlFor="demo">Aceito os termos</Label>
          </div>
        ),
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      { name: "Progress", example: <Progress value={60} className="w-[200px]" /> },
      { name: "Separator", example: <Separator className="w-[200px]" /> },
    ],
  },
];

export function ComponentsShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Componentes</h2>
        <p className="mt-1 text-muted-foreground">
          Atoms, molecules e organisms — 54 atoms, 36 molecules, 23 organisms.
        </p>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="space-y-8">
          {COMPONENT_CATEGORIES.map((cat) => (
            <Card key={cat.title}>
              <CardHeader>
                <CardTitle>{cat.title}</CardTitle>
                <CardDescription>Exemplos ao vivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {cat.items.map((item) => (
                    <div key={item.name} className="flex flex-col items-start gap-2">
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                      {item.example}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atoms (54)</CardTitle>
              <CardDescription>
                Button, Badge, Input, Card, Checkbox, Skeleton, Tabs, Alert, Dialog, Dropdown,
                Tooltip, Command, Collapsible, Scroll-area, Separator, Loader, Shimmer, Label,
                Radio-group, Switch, Slider, Progress, e mais.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Molecules (36)</CardTitle>
              <CardDescription>
                Button-group, Data-table, Stat-card, Form fields compostos, Combobox, e mais.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Organisms (23)</CardTitle>
              <CardDescription>
                Dashboard-layout, Sidebar, Script-editor, Resizable-layout, e mais.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
