# 📄 Read XML: Leitura e Análise de Arquivos XML5 ANBIMA

## Overview

Lê e analisa arquivos XML5 ANBIMA utilizando **Nokogiri** (biblioteca Ruby) para parsing e validação, seguindo as regras especializadas da `ariel-xml5-rule`.

Garante análise completa de estrutura, conformidade regulatória e validação de campos obrigatórios conforme padrão XML5 da ANBIMA.

Utiliza Nokogiri para parsing seguro e eficiente de arquivos XML, com suporte a validação estrutural e análise de conteúdo.

## Parâmetros

- **--file**: Caminho do arquivo XML a ser lido (obrigatório)
- **--validate**: Executar validação completa de conformidade (opcional, padrão: `true`)
- **--extract**: Extrair seções específicas do XML (opcional, ex: `--extract="BalForAcct,SubAcctDtls"`)
- **--format**: Formato de saída - `summary` | `detailed` | `json` (opcional, padrão: `summary`)

## 1. Preparação e Carregamento de Regras

- [ ] **SEMPRE carregue** a regra XML5 ANBIMA: `fetch_rules(["core/specialized/ariel-xml5-rule"])`
- [ ] **SEMPRE valide** que o arquivo XML existe e é acessível
- [ ] **SEMPRE verifique** se Nokogiri está disponível no ambiente Ruby
- [ ] **SEMPRE confirme** encoding do arquivo (UTF-8 obrigatório)
- [ ] **SEMPRE valide** parâmetros fornecidos (file, validate, extract, format)

## 2. Leitura e Parsing do XML

### 2.1 Carregamento do Arquivo

- [ ] **SEMPRE use** Nokogiri para parsing seguro do XML:

```ruby
# ✅ CORRETO: Carregar XML com Nokogiri
require 'nokogiri'

xml_file = File.read(file_path)
doc = Nokogiri::XML(xml_file)

# ✅ CORRETO: Com tratamento de encoding
xml_file = File.read(file_path, encoding: 'UTF-8')
doc = Nokogiri::XML(xml_file) do |config|
  config.strict.noblanks
end
```

- [ ] **SEMPRE valide** que o XML é bem formado antes de processar
- [ ] **SEMPRE trate** erros de parsing com mensagens claras
- [ ] **SEMPRE verifique** namespace correto: `urn:iso:std:iso:20022:tech:xsd:semt.003.001.04`

### 2.2 Validação Estrutural

- [ ] **SEMPRE verifique** elementos obrigatórios conforme regra XML5:

```ruby
# ✅ CORRETO: Validar estrutura obrigatória
namespace = 'urn:iso:std:iso:20022:tech:xsd:semt.003.001.04'

# Business Application Header
bah = doc.at_xpath("//xmlns:bsnsMsg", xmlns: namespace)
raise "BAH não encontrado" unless bah

# Paginação
pgntn = doc.at_xpath("//xmlns:Pgntn", xmlns: namespace)
raise "Paginação não encontrada" unless pgntn

# Detalhes Gerais
stmt_gnl_dtls = doc.at_xpath("//xmlns:StmtGnlDtls", xmlns: namespace)
raise "Detalhes Gerais não encontrados" unless stmt_gnl_dtls

# Custodiante (obrigatório)
sfkpg_acct = doc.at_xpath("//xmlns:SfkpgAcct", xmlns: namespace)
raise "Custodiante não encontrado" unless sfkpg_acct
```

- [ ] **SEMPRE valide** namespace correto do documento
- [ ] **SEMPRE verifique** elementos obrigatórios presentes
- [ ] **SEMPRE identifique** elementos opcionais corretamente

## 3. Análise de Conteúdo

### 3.1 Business Application Header (BAH)

- [ ] **SEMPRE extraia** campos obrigatórios do BAH:

```ruby
# ✅ CORRETO: Extrair BAH
def extract_bah(doc, namespace)
  bah = doc.at_xpath("//xmlns:bsnsMsg", xmlns: namespace)
  return nil unless bah

  {
    informante: bah.at_xpath(".//xmlns:fr//xmlns:nm", xmlns: namespace)&.text,
    cnpj_informante: bah.at_xpath(".//xmlns:fr//xmlns:id//xmlns:othr//xmlns:id", xmlns: namespace)&.text,
    destinatario: bah.at_xpath(".//xmlns:to//xmlns:nm", xmlns: namespace)&.text,
    msg_def_idr: bah.at_xpath(".//xmlns:msgDefIdr", xmlns: namespace)&.text,
    biz_svc: bah.at_xpath(".//xmlns:bizSvc", xmlns: namespace)&.text,
    id_msg_sender: bah.at_xpath(".//xmlns:galgoHdr//xmlns:idMsgSender", xmlns: namespace)&.text
  }
end
```

- [ ] **SEMPRE valide** campos obrigatórios 001-008 do BAH
- [ ] **SEMPRE verifique** formato de CNPJ (14 caracteres)
- [ ] **SEMPRE confirme** mensagem: `semt.003.001.04`
- [ ] **SEMPRE confirme** serviço: `Arquivo de Posição 5.0`

### 3.2 Paginação e Detalhes Gerais

- [ ] **SEMPRE extraia** informações de paginação:

```ruby
# ✅ CORRETO: Extrair paginação
def extract_pagination(doc, namespace)
  pgntn = doc.at_xpath("//xmlns:Pgntn", xmlns: namespace)
  return nil unless pgntn

  {
    pagina_atual: pgntn.at_xpath(".//xmlns:PgNb", xmlns: namespace)&.text,
    ultima_pagina: pgntn.at_xpath(".//xmlns:LastPgInd", xmlns: namespace)&.text == 'true'
  }
end
```

- [ ] **SEMPRE extraia** detalhes gerais (StmtGnlDtls)
- [ ] **SEMPRE valide** campos obrigatórios 009-016
- [ ] **SEMPRE verifique** data de posição válida

### 3.3 Prestadores

- [ ] **SEMPRE extraia** informações dos prestadores:

```ruby
# ✅ CORRETO: Extrair prestadores
def extract_providers(doc, namespace)
  {
    administrador: extract_provider(doc, namespace, 'AcctOwnr'),
    gestor: extract_provider(doc, namespace, 'AcctSvcr'),
    custodiante: extract_provider(doc, namespace, 'SfkpgAcct')
  }
end

def extract_provider(doc, namespace, element_name)
  provider = doc.at_xpath("//xmlns:#{element_name}", xmlns: namespace)
  return nil unless provider

  {
    cnpj: provider.at_xpath(".//xmlns:id//xmlns:othr//xmlns:id", xmlns: namespace)&.text,
    nome: provider.at_xpath(".//xmlns:nm", xmlns: namespace)&.text
  }
end
```

- [ ] **SEMPRE valide** custodiante (obrigatório)
- [ ] **SEMPRE verifique** CNPJ dos prestadores (campos 020-029)
- [ ] **SEMPRE identifique** administrador e gestor (opcionais)

### 3.4 Detalhes da Carteira

- [ ] **SEMPRE extraia** informações da carteira/classe/subclasse:

```ruby
# ✅ CORRETO: Extrair detalhes da carteira
def extract_portfolio_details(doc, namespace)
  doc.xpath("//xmlns:BalForAcct", xmlns: namespace).map do |bal|
    {
      isin: bal.at_xpath(".//xmlns:FinInstrmId//xmlns:ISIN", xmlns: namespace)&.text,
      cnpj: bal.at_xpath(".//xmlns:Id//xmlns:OrgId//xmlns:Othr//xmlns:Id", xmlns: namespace)&.text,
      quantidade_cotas: bal.at_xpath(".//xmlns:Bal//xmlns:Qty", xmlns: namespace)&.text,
      valor_cota: bal.at_xpath(".//xmlns:Bal//xmlns:Valtn//xmlns:Amt", xmlns: namespace)&.text,
      total_ativos: bal.at_xpath(".//xmlns:Bal//xmlns:Valtn//xmlns:Amt", xmlns: namespace)&.text
    }
  end
end
```

- [ ] **SEMPRE valide** campos obrigatórios 030-049
- [ ] **SEMPRE verifique** cálculos de patrimônio líquido
- [ ] **SEMPRE identifique** tipo de fundo (classe única, multi-classe, etc.)

### 3.5 Detalhes dos Ativos

- [ ] **SEMPRE extraia** informações dos ativos:

```ruby
# ✅ CORRETO: Extrair detalhes dos ativos
def extract_assets(doc, namespace)
  doc.xpath("//xmlns:SubAcctDtls", xmlns: namespace).map do |asset|
    {
      isin: asset.at_xpath(".//xmlns:FinInstrmId//xmlns:ISIN", xmlns: namespace)&.text,
      nome: asset.at_xpath(".//xmlns:FinInstrmAttrbts//xmlns:Nm", xmlns: namespace)&.text,
      quantidade: asset.at_xpath(".//xmlns:Bal//xmlns:Qty", xmlns: namespace)&.text,
      valor: asset.at_xpath(".//xmlns:Bal//xmlns:Valtn//xmlns:Amt", xmlns: namespace)&.text,
      tipo: asset.at_xpath(".//xmlns:FinInstrmAttrbts//xmlns:ClssfctnTp", xmlns: namespace)&.text
    }
  end
end
```

- [ ] **SEMPRE identifique** tipo de ativo (renda fixa, variável, derivativo, etc.)
- [ ] **SEMPRE valide** códigos ISIN quando presentes
- [ ] **SEMPRE verifique** valores e quantidades consistentes

### 3.6 Despesas e Provisões

- [ ] **SEMPRE extraia** despesas e provisões:

```ruby
# ✅ CORRETO: Extrair despesas
def extract_expenses(doc, namespace)
  expenses = []
  
  # Despesas liquidadas
  doc.xpath("//xmlns:Bal//xmlns:BalTp[.='EXPN']", xmlns: namespace).each do |expense|
    expenses << {
      tipo: 'EXPN',
      valor: expense.at_xpath("../xmlns:Valtn//xmlns:Amt", xmlns: namespace)&.text,
      descricao: 'Despesas liquidadas'
    }
  end
  
  expenses
end
```

- [ ] **SEMPRE identifique** códigos ISO 20022 (EXPN, MANF, EQUL, CUST, etc.)
- [ ] **SEMPRE valide** campos obrigatórios 056-097
- [ ] **SEMPRE verifique** cálculos de provisões

## 4. Validação de Conformidade

### 4.1 Validação Estrutural

- [ ] **SEMPRE valide** estrutura XML conforme schema XSD
- [ ] **SEMPRE verifique** namespace correto
- [ ] **SEMPRE confirme** elementos obrigatórios presentes
- [ ] **SEMPRE valide** hierarquia correta dos elementos

### 4.2 Validação de Campos Obrigatórios

- [ ] **SEMPRE valide** campos obrigatórios conforme especificação:

```ruby
# ✅ CORRETO: Validar campos obrigatórios
def validate_required_fields(doc, namespace)
  errors = []
  
  # Campos 001-008 (BAH)
  bah = doc.at_xpath("//xmlns:bsnsMsg", xmlns: namespace)
  errors << "Campo 001: Informante não encontrado" unless bah.at_xpath(".//xmlns:fr//xmlns:nm", xmlns: namespace)
  errors << "Campo 002: CNPJ informante não encontrado" unless bah.at_xpath(".//xmlns:fr//xmlns:id//xmlns:othr//xmlns:id", xmlns: namespace)
  
  # Campos 009-016 (Paginação e Status)
  errors << "Campo 013: Data posição não encontrada" unless doc.at_xpath("//xmlns:StmtGnlDtls//xmlns:FrDtToDt//xmlns:FrDt", xmlns: namespace)
  
  errors
end
```

- [ ] **SEMPRE valide** campos inspecionados pelo PREVIC (002-026, 013-031, 042-049, etc.)
- [ ] **SEMPRE verifique** formato de códigos (CNPJ, ISIN, CVM)
- [ ] **SEMPRE confirme** valores financeiros consistentes

### 4.3 Validação de Cálculos

- [ ] **SEMPRE valide** fórmulas de patrimônio líquido:

```ruby
# ✅ CORRETO: Validar cálculos
def validate_calculations(doc, namespace)
  errors = []
  
  # PL = Cotas × Valor da Cota
  quantidade_cotas = doc.at_xpath("//xmlns:Bal//xmlns:Qty", xmlns: namespace)&.text.to_f
  valor_cota = doc.at_xpath("//xmlns:Bal//xmlns:Valtn//xmlns:Amt", xmlns: namespace)&.text.to_f
  pl_calculado = quantidade_cotas * valor_cota
  
  # Verificar se confere com total de ativos
  total_ativos = doc.at_xpath("//xmlns:Bal//xmlns:Valtn//xmlns:Amt", xmlns: namespace)&.text.to_f
  
  unless (pl_calculado - total_ativos).abs < 0.01
    errors << "Divergência no cálculo de PL: Calculado=#{pl_calculado}, Declarado=#{total_ativos}"
  end
  
  errors
end
```

- [ ] **SEMPRE verifique** PL = Cotas × Valor da Cota
- [ ] **SEMPRE valide** PL = [Total de Ativos] - [Cotas a Emitir] - [Cotas a Resgatar] - [A Pagar] + [A Receber]
- [ ] **SEMPRE confirme** somatórios de ativos consistentes

## 5. Formatação de Saída

### 5.1 Formato Summary

- [ ] **SEMPRE forneça** resumo estruturado:

```ruby
# ✅ CORRETO: Formato summary
def format_summary(analysis)
  <<~SUMMARY
    ## 📋 Análise do Arquivo XML5 ANBIMA
    
    ### Informações Gerais
    - Informante: #{analysis[:bah][:informante]}
    - CNPJ: #{analysis[:bah][:cnpj_informante]}
    - Data Posição: #{analysis[:detalhes_gerais][:data_posicao]}
    
    ### Carteira
    - Total de Ativos: #{analysis[:carteira][:total_ativos]}
    - Quantidade de Cotas: #{analysis[:carteira][:quantidade_cotas]}
    - Valor da Cota: #{analysis[:carteira][:valor_cota]}
    
    ### Validações
    - Estrutura: #{analysis[:validacao][:estrutura] ? '✅ Válida' : '❌ Inválida'}
    - Campos Obrigatórios: #{analysis[:validacao][:campos_obrigatorios].empty? ? '✅ OK' : "❌ #{analysis[:validacao][:campos_obrigatorios].count} erros"}
    - Cálculos: #{analysis[:validacao][:calculos].empty? ? '✅ OK' : "❌ #{analysis[:validacao][:calculos].count} erros"}
  SUMMARY
end
```

### 5.2 Formato Detailed

- [ ] **SEMPRE forneça** análise detalhada com todos os elementos
- [ ] **SEMPRE inclua** caminhos XPath para localização
- [ ] **SEMPRE liste** todos os ativos, despesas e provisões

### 5.3 Formato JSON

- [ ] **SEMPRE forneça** saída em JSON estruturado:

```ruby
# ✅ CORRETO: Formato JSON
require 'json'

def format_json(analysis)
  JSON.pretty_generate({
    bah: analysis[:bah],
    paginacao: analysis[:paginacao],
    prestadores: analysis[:prestadores],
    carteira: analysis[:carteira],
    ativos: analysis[:ativos],
    despesas: analysis[:despesas],
    validacao: {
      estrutura: analysis[:validacao][:estrutura],
      campos_obrigatorios: analysis[:validacao][:campos_obrigatorios],
      calculos: analysis[:validacao][:calculos]
    }
  })
end
```

## 6. Tratamento de Erros

### 6.1 Erros de Parsing

- [ ] **SEMPRE trate** erros de XML mal formado:

```ruby
# ✅ CORRETO: Tratar erros de parsing
begin
  doc = Nokogiri::XML(xml_file) do |config|
    config.strict.noblanks
  end
rescue Nokogiri::XML::SyntaxError => e
  puts "❌ Erro ao processar XML: #{e.message}"
  puts "Linha: #{e.line}, Coluna: #{e.column}"
  exit 1
end
```

### 6.2 Erros de Validação

- [ ] **SEMPRE liste** todos os erros encontrados
- [ ] **SEMPRE forneça** localização precisa (XPath)
- [ ] **SEMPRE sugira** correções quando possível

### 6.3 Erros de Encoding

- [ ] **SEMPRE valide** encoding UTF-8
- [ ] **SEMPRE trate** caracteres inválidos
- [ ] **SEMPRE converta** encoding quando necessário

## 7. Exemplos de Uso

### 7.1 Leitura Básica

```bash
# Ler arquivo XML com validação padrão
read-xml --file="arquivo.xml"
```

### 7.2 Leitura com Extração

```bash
# Extrair apenas seções específicas
read-xml --file="arquivo.xml" --extract="BalForAcct,SubAcctDtls"
```

### 7.3 Leitura sem Validação

```bash
# Ler sem validação completa (apenas parsing)
read-xml --file="arquivo.xml" --validate=false
```

### 7.4 Leitura com Formato JSON

```bash
# Saída em formato JSON
read-xml --file="arquivo.xml" --format=json
```

## 8. Checklist de Validação Final

- [ ] **SEMPRE verifique** que regra `ariel-xml5-rule` foi carregada
- [ ] **SEMPRE confirme** que Nokogiri está disponível
- [ ] **SEMPRE valide** que arquivo XML foi lido corretamente
- [ ] **SEMPRE verifique** que namespace está correto
- [ ] **SEMPRE confirme** que elementos obrigatórios foram validados
- [ ] **SEMPRE valide** que cálculos foram verificados
- [ ] **SEMPRE forneça** saída formatada conforme solicitado
- [ ] **SEMPRE trate** erros com mensagens claras

## Notas Importantes

- **SEMPRE use** Nokogiri para parsing seguro de XML
- **SEMPRE valide** encoding UTF-8 obrigatório
- **SEMPRE verifique** namespace correto: `urn:iso:std:iso:20022:tech:xsd:semt.003.001.04`
- **SEMPRE siga** regras da `ariel-xml5-rule` para validação
- **SEMPRE forneça** localização precisa de erros (XPath)
- **SEMPRE valide** campos obrigatórios conforme especificação ANBIMA
- **SEMPRE verifique** cálculos de patrimônio líquido
- **SEMPRE trate** erros com mensagens claras e acionáveis

