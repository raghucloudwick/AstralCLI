# Button Component

## Description

A versatile button component that supports various styles, sizes, colors, and states like loading or disabled. Includes support for prefix and suffix icons, as well as tooltips.

## Import

```tsx
import { Button } from '@cloudwick/astral-ui';
```

## Usage Examples

**Basic Button:**
```tsx
<Button onClick={() => alert('Clicked!')}>Click Me</Button>
```

**Primary Filled Button:**
```tsx
<Button variant="filled" color="primary" onClick={() => alert('Primary Clicked!')}>
  Primary Action
</Button>
```

**Secondary Outline Button (Medium Size):**
```tsx
<Button variant="outline" color="secondary" size="md" onClick={() => alert('Secondary Clicked!')}>
  Secondary Action
</Button>
```

**Button with Icons:**
```tsx
<Button 
  variant="filled" 
  color="success" 
  prefixIcon="check" 
  suffixIcon="arrow-right"
>
  Success
</Button>
```

**Button with Loading State:**
```tsx
<Button loading variant="filled" color="primary">
  Submitting
</Button>
```

**Button with Tooltip:**
```tsx
<Button 
  variant="filled" 
  color="primary" 
  tooltip="This is a helpful tooltip"
>
  Hover Me
</Button>
```

## Props

| Prop              | Type                                  | Default     | Description                                      |
|-------------------|---------------------------------------|-------------|--------------------------------------------------|
| `variant`         | `'filled' \| 'outline' \| 'shade' \| 'text'` | `'filled'`  | The style variant of the button.                 |
| `color`           | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | The color theme of the button.                   |
| `size`            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | The size of the button.                          |
| `loading`         | `boolean`                             | `false`     | If `true`, shows a loading spinner.              |
| `type`            | `'button' \| 'submit' \| 'reset'`     | `'button'`  | HTML button type attribute.                      |
| `disabled`        | `boolean`                             | `false`     | If `true`, the button will be disabled.          |
| `className`       | `string`                              | `undefined` | Additional CSS classes for the button element.   |
| `prefixIcon`      | `IconType \| ReactNode`               | `undefined` | Icon to display before the button text.          |
| `suffixIcon`      | `IconType \| ReactNode`               | `undefined` | Icon to display after the button text.           |
| `tooltip`         | `ReactNode`                           | `undefined` | Content to display in a tooltip on hover.        |
| `tooltipPlacement`| `Placement`                           | `undefined` | Position of the tooltip relative to the button.  |
| `onClick`         | `(event?: React.MouseEvent<HTMLButtonElement>) => void` | `undefined` | Handler function for the click event.            |
| `children`        | `React.ReactNode`                     | `undefined` | The content of the button.                       |

The component also accepts all standard HTML button attributes as additional props. 