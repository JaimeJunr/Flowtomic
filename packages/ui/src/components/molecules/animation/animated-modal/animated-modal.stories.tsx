import type { Meta, StoryObj } from "@storybook/react-vite";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../../../atoms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalTrigger } from "./animated-modal";

const meta = {
  title: "Flowtomic UI/Molecules/Animation/AnimatedModal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial aberto do modal",
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Modal>
        <ModalTrigger asChild>
          <Button>Abrir Modal</Button>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <h2 className="text-2xl font-bold mb-4">Modal Animado</h2>
            <p className="text-muted-foreground mb-6">
              Este é um modal com animações 3D e backdrop blur. Clique fora, pressione ESC ou use o
              botão de fechar.
            </p>
            <div className="space-y-2">
              <p className="text-sm">✨ Animações 3D com perspectiva</p>
              <p className="text-sm">🎨 Backdrop blur suave</p>
              <p className="text-sm">⌨️ Suporte a tecla ESC</p>
              <p className="text-sm">👆 Fecha ao clicar fora</p>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline">Cancelar</Button>
            <Button>Confirmar</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  ),
};

export const WithForm: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Modal>
        <ModalTrigger asChild>
          <Button variant="default">Criar Nova Tarefa</Button>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <h2 className="text-2xl font-bold mb-4">Nova Tarefa</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="task-title" className="text-sm font-medium mb-2 block">
                  Título
                </label>
                <input
                  id="task-title"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div>
                <label htmlFor="task-description" className="text-sm font-medium mb-2 block">
                  Descrição
                </label>
                <textarea
                  id="task-description"
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  placeholder="Digite a descrição da tarefa"
                />
              </div>
              <div>
                <label htmlFor="task-priority" className="text-sm font-medium mb-2 block">
                  Prioridade
                </label>
                <select id="task-priority" className="w-full px-3 py-2 border rounded-md">
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                </select>
              </div>
            </form>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  ),
};

export const WithImages: Story = {
  render: () => {
    const images = [
      "https://images.unsplash.com/photo-1517322048670-4fba75cbbb62?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=3425&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];

    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Modal>
          <ModalTrigger asChild>
            <Button>Ver Galeria</Button>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <h2 className="text-2xl font-bold mb-6 text-center">Galeria de Imagens</h2>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                {images.map((image, imageIndex) => {
                  const imageId = `modal-image-${image}`;
                  return (
                    <motion.div
                      key={imageId}
                      initial={{ rotate: Math.random() * 20 - 10 }}
                      whileHover={{
                        scale: 1.1,
                        rotate: 0,
                        zIndex: 100,
                      }}
                      whileTap={{
                        scale: 1.05,
                        rotate: 0,
                      }}
                      className="rounded-xl p-1 bg-background border shrink-0 overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Imagem ${imageIndex + 1}`}
                        width="200"
                        height="200"
                        className="rounded-lg h-32 w-32 object-cover"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </ModalContent>
            <ModalFooter>
              <Button variant="outline">Fechar</Button>
            </ModalFooter>
          </ModalBody>
        </Modal>
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <Button onClick={() => setOpen(!open)}>{open ? "Fechar Modal" : "Abrir Modal"}</Button>
        <p className="text-sm text-muted-foreground">
          Estado controlado externamente: {open ? "Aberto" : "Fechado"}
        </p>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalBody>
            <ModalContent>
              <h2 className="text-2xl font-bold mb-4">Modal Controlado</h2>
              <p className="text-muted-foreground">
                Este modal é controlado externamente. O estado é gerenciado pelo componente pai
                através das props <code className="text-xs bg-muted px-1 py-0.5 rounded">open</code>{" "}
                e <code className="text-xs bg-muted px-1 py-0.5 rounded">onOpenChange</code>.
              </p>
            </ModalContent>
            <ModalFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => setOpen(false)}>Confirmar</Button>
            </ModalFooter>
          </ModalBody>
        </Modal>
      </div>
    );
  },
};

export const FooterAlignment: Story = {
  render: () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alinhamento do Footer</h3>

        <Modal>
          <ModalTrigger asChild>
            <Button variant="outline" size="sm">
              Esquerda
            </Button>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <h2 className="text-xl font-bold mb-2">Footer à Esquerda</h2>
              <p className="text-sm text-muted-foreground">Os botões estão alinhados à esquerda.</p>
            </ModalContent>
            <ModalFooter align="left">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button size="sm">Confirmar</Button>
            </ModalFooter>
          </ModalBody>
        </Modal>

        <Modal>
          <ModalTrigger asChild>
            <Button variant="outline" size="sm">
              Centro
            </Button>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <h2 className="text-xl font-bold mb-2">Footer Centralizado</h2>
              <p className="text-sm text-muted-foreground">Os botões estão centralizados.</p>
            </ModalContent>
            <ModalFooter align="center">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button size="sm">Confirmar</Button>
            </ModalFooter>
          </ModalBody>
        </Modal>

        <Modal>
          <ModalTrigger asChild>
            <Button variant="outline" size="sm">
              Direita (Padrão)
            </Button>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <h2 className="text-xl font-bold mb-2">Footer à Direita</h2>
              <p className="text-sm text-muted-foreground">
                Os botões estão alinhados à direita (padrão).
              </p>
            </ModalContent>
            <ModalFooter align="right">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button size="sm">Confirmar</Button>
            </ModalFooter>
          </ModalBody>
        </Modal>
      </div>
    </div>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Modal>
        <ModalTrigger asChild>
          <Button variant="secondary">Abrir Modal</Button>
        </ModalTrigger>
        <ModalBody showCloseButton={false}>
          <ModalContent>
            <h2 className="text-2xl font-bold mb-4">Modal Sem Botão de Fechar</h2>
            <p className="text-muted-foreground">
              Este modal não exibe o botão de fechar no canto superior direito. Use os botões
              abaixo, clique fora ou pressione ESC para fechar.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline">Cancelar</Button>
            <Button>Confirmar</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Modal>
        <ModalTrigger asChild>
          <Button>Ver Conteúdo Longo</Button>
        </ModalTrigger>
        <ModalBody>
          <ModalContent maxHeight="60vh">
            <h2 className="text-2xl font-bold mb-4">Conteúdo Longo</h2>
            <div className="space-y-4">
              {Array.from({ length: 20 }, (_, i) => {
                const paragraphId = `long-content-paragraph-${i + 1}`;
                return (
                  <p key={paragraphId} className="text-sm text-muted-foreground">
                    Parágrafo {i + 1}: Este é um exemplo de conteúdo longo que demonstra como o
                    modal lida com scroll quando o conteúdo excede a altura máxima. O modal mantém o
                    header e footer visíveis enquanto permite scroll no conteúdo.
                  </p>
                );
              })}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline">Fechar</Button>
            <Button>Salvar</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  ),
};
