# toast.tsx

A **Toast** component set built on Radix UI’s Toast primitive. It provides customizable toasts with variants, swipe interactions, and responsive viewport placement.

## Provider & Viewport

- **ToastProvider**: Wraps your app to manage toast context.
- **ToastViewport**: Positions toasts; fixed top on mobile, bottom-right on larger screens.

```tsx
<ToastProvider>
  {/* Toasts */}
  <ToastViewport />
</ToastProvider>
```

## Variants

| Variant | Styles |
| --- | --- |
| default | `border bg-background text-foreground` |
| destructive | `border-destructive bg-destructive text-destructive-foreground` |


## Components

- **Toast**

A single toast container. Accepts Radix’s `Root` props plus `variant`.

```tsx
  <Toast variant="destructive" open>
    {/* ... */}
  </Toast>
```

- **ToastTitle**

Displays a bolded, semibold title.

- **ToastDescription**

Shows secondary text with reduced opacity.

- **ToastAction**

Renders an inline button for user actions.

- **ToastClose**

A close button (✕) that appears on hover or focus.

---

# toaster.tsx

A container that renders active toasts from a custom hook.

## Usage

- **useToast** hook provides an array of toast data.
- **Toaster** maps each toast to a `<Toast>` with title, description, action, and a close button.

```tsx
function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
```

- **Responsiveness**

Automatically adapts placement via `ToastViewport`.

---

# toggle.tsx

A styled toggle button based on Radix’s Toggle primitive. Supports size and variant.

## Variants

| Variant | Description |
| --- | --- |
| default | Transparent background |
| outline | Bordered, transparent background+shadow |


| Size | Height + padding |
| --- | --- |
| sm | `h-8 px-1.5` |
| default | `h-9 px-2` |
| lg | `h-10 px-2.5` |


## Toggle

```tsx
<Toggle variant="outline" size="lg" pressed onPressedChange={…} />
```

- Uses `cva` for class variance.
- Forwards all Radix props.

---

# toggle-group.tsx

Groups multiple `<Toggle>` into an exclusive or multiple-select set.

## ToggleGroup

- Wraps children in Radix `ToggleGroup.Root`.
- Passes `variant` & `size` via context.

## ToggleGroupItem

- Renders each toggle.
- Inherits `variant` & `size` from group.

```tsx
<ToggleGroup type="single" defaultValue="left">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
  <ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

- Handles first/last border-radius.
- Synchronizes styles with `toggleVariants`.

---

# use-mobile.tsx

A React hook to detect mobile viewport width.

## useIsMobile

```ts
const isMobile = useIsMobile();
```

- Returns `true` if `window.innerWidth < 768px`.
- Listens to viewport changes via `matchMedia`.
- Initializes state on mount.

---

# tooltip.tsx

Wrapper around Radix Tooltip primitives, offering provider, trigger, and styled content.

## TooltipProvider

- Sets global `delayDuration` (default `0`).

## Tooltip, TooltipTrigger, TooltipContent

```tsx
<Tooltip>
  <TooltipTrigger>
    <button>Hover me</button>
  </TooltipTrigger>
  <TooltipContent sideOffset={4}>
    Tooltip text
    <TooltipPrimitive.Arrow />
  </TooltipContent>
</Tooltip>
```

- **TooltipContent** styles fade and zoom animations.
- Aligns arrow and content origin based on `side`.

---

# accordion.tsx

Accessible accordion built on Radix’s Accordion primitive.

## Components

- **Accordion**: Root wrapper.
- **AccordionItem**: Single collapsible item.
- **AccordionTrigger**: Header button with rotating chevron.
- **AccordionContent**: Animated content panel.

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Details...</AccordionContent>
  </AccordionItem>
</Accordion>
```

- Animations: slide up/down on open/close.
- Chevron rotates 180° when open.

---

# alert.tsx

A styled alert box with variants for default and destructive tones.

## alertVariants

| Variant | Styles |
| --- | --- |
| default | `bg-card text-card-foreground` |
| destructive | `bg-card text-destructive + icon/text color accent` |


## Components

- **Alert** (`role="alert"`): Container with grid layout.
- **AlertTitle**: Bolded title.
- **AlertDescription**: Secondary text.

```tsx
<Alert variant="destructive">
  <AlertTitle>Error!</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

---

*Documentation continues for remaining components…*