---
name: solid-clean-react
description: Use when implementing React components or features following SOLID principles and clean code best practices. Includes proper component composition, hooks patterns, and avoiding common anti-patterns.
triggers:
  - solid
  - clean code
  - react component
  - hooks
  - best practices
  - refactor
  - patrón
  - componente
role: specialist
scope: implementation
output-format: code
---

# SOLID & Clean Code for React

Expert in implementing React code following SOLID principles and clean code best practices. Focus on maintainability, testability, and readability.

## When to Use This Skill

- Creating new React components
- Refactoring existing code to follow SOLID
- Implementing hooks with proper patterns
- Solving architecture decisions in React
- Reviewing code for best practices
- Teaching or explaining patterns

## SOLID Principles in React

### S - Single Responsibility Principle

**Cada componente/hook debe hacer UNA cosa**

```tsx
// ❌ MAL: Componente hace muchas cosas
const UserDashboard = () => {
  const [users, setUsers] = useState([])
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState([])
  
  // Fetch users
  // Handle theme
  // Fetch notifications
  // Render everything
}

// ✅ BIEN: Responsabilidades separadas
const UserList = ({ users }) => { /* solo renderiza usuarios */ }
const ThemeProvider = ({ children }) => { /* solo maneja tema */ }
const NotificationBell = ({ notifications }) => { /* solo notificaciones */ }
```

### O - Open/Closed Principle

**Abierto para extensión, cerrado para modificación**

```tsx
// ❌ MAL: Modificar componente para cada nuevo tipo
const Button = ({ variant, ...props }) => {
  if (variant === 'primary') return <button className="btn-primary" {...props} />
  if (variant === 'secondary') return <button className="btn-secondary" {...props} />
  if (variant === 'danger') return <button className="btn-danger" {...props} />
  // Cada vez que quieras un nuevo estilo, modificas este componente
}

// ✅ BIEN: Extender sin modificar
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
    },
  },
})

const Button = ({ variant, className, ...props }) => (
  <button className={buttonVariants({ variant, className })} {...props} />
)
```

### L - Liskov Substitution Principle

**Los hijos deben poder reemplazar a los padres sin romper funcionalidad**

```tsx
// ❌ MAL: Componente hijo tiene comportamiento diferente al esperado
const Card = ({ children }) => <div className="card">{children}</div>
const SpecialCard = ({ children }) => { /* No acepta children, hace otra cosa */ }

// ✅ BIEN: Componentes hijo son substituibles
const BaseCard = ({ children, className }) => 
  <div className={cn('card', className)}>{children}</div>

const CardWithHeader = ({ header, children }) => (
  <BaseCard>
    <CardHeader>{header}</CardHeader>
    {children}
  </BaseCard>
)
```

### I - Interface Segregation Principle

**Preferir muchos interfaces pequeños a uno grande**

```tsx
// ❌ MAL: Hook con muchas responsabilidades
const useUserData = () => {
  // Busca usuarios, maneja auth, notificaciones, preferencias...
}

// ✅ BIEN: Hooks pequeños y específicos
const useUsers = () => { /* solo buscar usuarios */ }
const useAuth = () => { /* solo auth */ }
const useNotifications = () => { /* solo notificaciones */ }
const usePreferences = () => { /* solo preferencias */ }
```

### D - Dependency Inversion Principle

**Depender de abstracciones, no de concreciones**

```tsx
// ❌ MAL: Dependencia directa de implementación
const UserList = () => {
  const users = useQuery({ queryKey: ['users'], queryFn: fetchUsersFromAPI })
  //直接依赖具体实现
}

// ✅ BIEN: Depender de abstracciones
const UserList = ({ fetchUsers = defaultFetchUsers }) => {
  const users = useQuery({ 
    queryKey: ['users'], 
    queryFn: fetchUsers  // Inyectar función, no hardcodear
  })
}

// Con un hook wrapper
const useUserList = (options) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: api.users.list,
    ...options,
  })
}
```

## Clean Code Patterns

### Nombrado

```tsx
// ❌ MAL: Nombres poco claros
const d = () => {
  const x = data?.map(i => i.v)
  return x?.filter(i => i > 10)
}

// ✅ BIEN: Nombres descriptivos
const useFilteredValues = () => {
  const relevantValues = data?.map(item => item.value)
  const filteredValues = relevantValues?.filter(value => value > threshold)
  return filteredValues
}
```

### Extraer Lógica a Hooks

```tsx
// ❌ MAL: Lógica de negocio en el componente
const UserProfile = () => {
  const [user, setUser] = useState(null)
  
  // Esta lógica debería estar en un hook
  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'active') {
          setUser(data)
        }
      })
  }, [id])
  
  // ... render
}

// ✅ BIEN: Lógica extraída
const useUser = (id) => useQuery({
  queryKey: ['user', id],
  queryFn: () => api.users.get(id).then(data => {
    if (data.status !== 'active') throw new Error('User not active')
    return data
  })
})

const UserProfile = ({ userId }) => {
  const { data: user, isLoading } = useUser(userId)
  // ... render más limpio
}
```

### Evitar Prop Drilling

```tsx
// ❌ MAL: Prop drilling
<GrandParent user={user} theme={theme} locale={locale}>
  <Parent user={user} theme={theme} locale={locale}>
    <Child user={user} theme={theme} locale={locale}>
      <GrandChild user={user} theme={theme} locale={locale} />
    </Child>
  </Parent>
</GrandParent>

// ✅ BIEN: Context o composicion
<AuthProvider>
  <ThemeProvider>
    <LocaleProvider>
      <GrandParent>
        <GrandChild />
      </GrandParent>
    </LocaleProvider>
  </ThemeProvider>
</AuthProvider>
```

## Constraints

### MUST DO
- Usar TypeScript con tipos explícitos
- Extraer lógica de negocio a hooks custom
- Mantener componentes pequeños (máx 100-150 líneas)
- Usar composición en lugar de prop drilling
- Documentar decisiones de arquitectura

### MUST NOT DO
- No crear "god components" que hacen todo
- No hardcodear valores que deberían ser configurables
- No mezclar lógica de negocio con presentación
- No usar any en TypeScript
- No crear funciones dentro del render
