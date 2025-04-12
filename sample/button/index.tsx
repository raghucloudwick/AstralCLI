import React, { forwardRef, ReactNode, useRef } from "react";
import clsx from "clsx";
import mergeRefs from "react-merge-refs";
import type { Placement } from "@floating-ui/react";
import { ADPIcon, type IconType } from "../adpIcon";
import { Tooltip } from "../tooltip";

export const colors = [ "primary", "secondary", "success", "warning", "error" ] as const;
export const variants = [ "filled", "outline", "shade", "text" ] as const;
export enum Sizes {
  XS = "xs",
  SM = "sm",
  MD = "md",
  LG = "lg",
  XL = "xl"
}

type Color = ( typeof colors )[number];
type Variant = ( typeof variants )[number];
type Size = `${Sizes}`;

export interface Props
  extends Omit<React.ComponentPropsWithoutRef<"button">, "css"> {
  /**
   * @description Size of the button.
   * @default md
   */
  size?: Size;
  /**
   * @description Color of the button.
   * @default primary
   */
  color?: Color;
  /**
   * @description Variant of the button.
   * @default filled
   */
  variant?: Variant;
  /**
   * @description The content to be displayed inside the button.
   * @type React.ReactNode
   */
  children?: React.ReactNode;
  /**
   * @description Shows loading animation instead of the button content
   * @default false
   */
  loading?: boolean;
  /**
   * @description Type of the button
   * @default button
   */
  type?: "button" | "submit" | "reset";
  /**
   * @description Prop to disable the Button
   * @default false
   */
  disabled?: boolean;
  /**
   * @description Pass space separated class names to override the Button styling
   */
  className?: string;
  /**
   * @description Icon to be displayed before the button's content.
   * This prop accepts either an IconType (string) or a ReactNode.
   * - If an IconType is provided, it will render an ADPIcon component.
   * - If a ReactNode is provided, it will be rendered as-is.
   * @type IconType | ReactNode
   */
  prefixIcon?: IconType | ReactNode;
  /**
   * @description Icon to be displayed after the button's content.
   * This prop accepts either an IconType (string) or a ReactNode.
   * - If an IconType is provided, it will render an ADPIcon component.
   * - If a ReactNode is provided, it will be rendered as-is.
   * @type IconType | ReactNode
   */
  suffixIcon?: IconType | ReactNode;
  /**
   * @description Tooltip to be displayed on hover of the button.
   * This prop accepts a ReactNode, if this is passed then the button will render
   * tooltip on hover of the button.
   * This tooltip is only on hover and not on click.
   * @type ReactNode
   */
  tooltip?: ReactNode;
  /**
   * @description Placement of the tooltip
   * @default bottom-end
   * @type Placement
   */
  tooltipPlacement?: Placement
  /**
   * @description Callback function to be called when the button is clicked
   * @type (event?: React.MouseEvent<HTMLButtonElement>) => void
   */
  onClick?: ( event?: React.MouseEvent<HTMLButtonElement> ) => void;
}

// Map of button size to spinner size
export const ButtonSizeToSpinnerMap: Record<
  Size,
  "xxs" | "xs" | "sm" | "md" | "lg" | "xl"
> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "sm",
  xl: "md"
};

/**
 * @ai-component Button
 * @description Renders a versatile button element based on the Astral UI design system. 
 * Supports various styles, sizes, colors, and states like disabled or loading.
 * Can display icons before or after content and tooltips on hover.
 * 
 * @usage-example
 * ```tsx
 * <Button 
 *   color="primary" 
 *   variant="filled" 
 *   onClick={() => console.log('Clicked!')}
 * >
 *   Click Me
 * </Button>
 * ```
 * 
 * @dependencies clsx, react-merge-refs, @floating-ui/react (for tooltip placement)
 */
export const Button = forwardRef<HTMLButtonElement, Props>( function Button(
  {
    size = "md",
    color = "primary",
    variant = "filled",
    children,
    loading = false,
    type = "button",
    disabled,
    className,
    onClick,
    prefixIcon,
    suffixIcon,
    tooltip,
    tooltipPlacement,
    ...restProps
  }: Props,
  ref
): React.ReactElement {
  const localRef = useRef<HTMLButtonElement>();

  /**
   * @internal
   * @description Creates the button element with appropriate styling and content
   */
  const buttonElement = (
    <button
      {...restProps}
      className={clsx(
        "adp-button",
        `adp-button-${size}`,
        `adp-button-${color}`,
        `adp-button-${color}--${variant}`,
        children && `adp-button-${size}--padded`,
        className
      )}
      disabled={disabled || loading}
      onClick={( event ) => {
        onClick?.( event );
      }}
      ref={mergeRefs( [ ref, localRef ] )}
      type={type}
    >
      {loading
        ? (
          <ADPIcon icon="spinner" spin size={ButtonSizeToSpinnerMap[size]} />
        )
        : prefixIcon && (
          typeof prefixIcon === "string"
            ? <ADPIcon icon={prefixIcon as IconType} fixedWidth size={ButtonSizeToSpinnerMap[size]} />
            : prefixIcon
        )
      }
      {children}
      {suffixIcon && (
        typeof suffixIcon === "string"
          ? <ADPIcon icon={suffixIcon as IconType} fixedWidth size={ButtonSizeToSpinnerMap[size]} />
          : suffixIcon
      )}
    </button>
  );

  // If tooltip is present and not null or empty, wrap the button with Tooltip.
  if ( tooltip !== null && tooltip !== undefined && tooltip !== false && tooltip !== "" ) {
    return (
      <Tooltip
        clickable={false}
        trigger={buttonElement}
        triggerAriaLabel={typeof tooltip === "string" ? tooltip : undefined}
        disabled={disabled}
        placement={tooltipPlacement}
      >
        {tooltip}
      </Tooltip>
    );
  }

  // Otherwise, return just the button
  return buttonElement;
});