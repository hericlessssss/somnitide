# Walkthrough: Feature "Progresso" (Sleep Score V1)

Implementação completa do sistema de score pessoal de sono e visualização no frontend com o tema Midnight Premium.

## 🚀 O que mudou

### Backend: Motor de Score e API
- **SleepProgressCalculator**: Novo serviço de domínio que implementa a fórmula V1.
    - Duração: Até 60 pontos.
    - Qualidade: Até 40 pontos.
    - Streak: Até 10 pontos de bônus.
    - Total: Clamper em 110 pontos.
- **GetProgressUseCase**: Agrupamento de sessões por dia (UTC), seleção da melhor sessão diária e cálculo de consistência (streak).
- **Endpoint**: `GET /api/v1/me/progress?days=7` protegido por JWT.

### Frontend: Experiência Premium (Refinada)
- **ProgressComponent**: Página situada em `/progress`, agora 100% harmonizada com o design do site.
- **Design Midnight Premium**: 
    - Layout centralizado (800px) e cabeçalho alinhado com o Histórico.
    - Cards com efeito **Glassmorphism** e bordas semânticas (Verde/Amarelo/Vermelho).
    - Visualização de Score Médio e Rank (Mestre do Sono, Alta Performance, etc).
    - Contador de Streak de fogo (🔥).
    - Timeline detalhada das últimas noites com decomposição do score (D/Q/B), seguindo o padrão visual da página de Histórico.
- **Navegação**: Ícone de troféu (`emoji_events`) na barra inferior e menu lateral.

## 🧪 Verificação Realizada

### Testes de Unidade (Backend)
- `SleepProgressCalculatorTest`: Validou todas as faixas de horas e ratings.
- `GetProgressTest`: Validou agrupamento por dia e lógica de streak consecutiva.

### Testes de Integração (Backend)
- `ProgressControllerTest`: Validou segurança JWT e retorno JSON correto.

### Testes de Frontend
- `ProgressComponentSpec`: Validou labels de rank e formatação de tempo.
- `ng test`: Todos os 50 testes passando.

## 📸 Screenshots (Mockup/Visual)

*(Abaixo, uma representação dos cards principais implementados)*

````carousel
```markdown
+---------------------------+
|      SCORE MÉDIO          |
|          85 / 110         |
|      ALTA PERFORMANCE     |
+---------------------------+
```
<!-- slide -->
```markdown
+---------------------------+
|      SEQUÊNCIA            |
|          5 DIAS           |
|      Mantendo o ritmo!    |
+---------------------------+
```
````

---
**Definition of Done**: Todas as regras de negócio aplicadas, testes verdes e documentação em dia.
