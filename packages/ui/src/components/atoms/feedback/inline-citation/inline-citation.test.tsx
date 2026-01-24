import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	InlineCitation,
	InlineCitationText,
	InlineCitationCard,
	InlineCitationCardTrigger,
	InlineCitationCardBody,
	InlineCitationSource,
} from "./inline-citation";

describe("InlineCitation", () => {
	describe("Renderização", () => {
		it("deve renderizar o InlineCitation", () => {
			render(
				<InlineCitation>
					<InlineCitationText>Texto com citação</InlineCitationText>
				</InlineCitation>
			);
			const text = screen.getByText("Texto com citação");
			expect(text).toBeInTheDocument();
		});

		it("deve renderizar InlineCitationText", () => {
			render(
				<InlineCitation>
					<InlineCitationText>Texto</InlineCitationText>
				</InlineCitation>
			);
			const text = screen.getByText("Texto");
			expect(text).toBeInTheDocument();
		});

		it("deve renderizar InlineCitationCard", () => {
			render(
				<InlineCitation>
					<InlineCitationText>Texto</InlineCitationText>
					<InlineCitationCard>
						<InlineCitationCardTrigger sources={["https://example.com"]} />
						<InlineCitationCardBody>
							<InlineCitationSource
								title="Título"
								url="https://example.com"
								description="Descrição"
							/>
						</InlineCitationCardBody>
					</InlineCitationCard>
				</InlineCitation>
			);
			const text = screen.getByText("Texto");
			expect(text).toBeInTheDocument();
		});

		it("deve renderizar InlineCitationSource", () => {
			render(
				<InlineCitationCard>
					<InlineCitationCardTrigger sources={["https://example.com"]} />
					<InlineCitationCardBody>
						<InlineCitationSource
							title="Título da Fonte"
							url="https://example.com"
							description="Descrição da fonte"
						/>
					</InlineCitationCardBody>
				</InlineCitationCard>
			);
			// O conteúdo só aparece quando o hover card está aberto
			const trigger = screen.getByText(/example\.com/);
			expect(trigger).toBeInTheDocument();
		});
	});
});

