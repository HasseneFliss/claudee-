# Design Specification

## Components

### Button

Interactive button for user actions

**Props:**
- `size`: [object Object]
- `loading`: [object Object]
- `variant`: [object Object]
- `disabled`: [object Object]
- `leftIcon`: [object Object]
- `fullWidth`: [object Object]
- `rightIcon`: [object Object]

**Variants:** primary, secondary, outline, ghost, destructive

### Input

Text input field for user data entry

**Props:**
- `size`: [object Object]
- `type`: [object Object]
- `error`: [object Object]
- `disabled`: [object Object]
- `leftIcon`: [object Object]
- `rightIcon`: [object Object]
- `placeholder`: [object Object]

**Variants:** default, filled, flushed

### SearchInput

Specialized search input with autocomplete dropdown

**Props:**
- `loading`: [object Object]
- `onSearch`: [object Object]
- `placeholder`: [object Object]
- `suggestions`: [object Object]
- `showSuggestions`: [object Object]

**Variants:** default, compact

### Card

Container component for grouping related content

**Props:**
- `size`: [object Object]
- `padding`: [object Object]
- `variant`: [object Object]
- `clickable`: [object Object]

**Variants:** default, elevated, outlined, filled

### ProductCard

Specialized card for displaying product information

**Props:**
- `product`: [object Object]
- `onWishlist`: [object Object]
- `onAddToCart`: [object Object]
- `showQuickView`: [object Object]

**Variants:** default, compact, featured

### Select

Dropdown select input for choosing from options

**Props:**
- `value`: [object Object]
- `options`: [object Object]
- `multiple`: [object Object]
- `searchable`: [object Object]
- `placeholder`: [object Object]

**Variants:** default, filled, outline

### Checkbox

Checkbox input for boolean selections

**Props:**
- `label`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]
- `indeterminate`: [object Object]

**Variants:** default, circle

### RadioButton

Radio button for single selection from group

**Props:**
- `name`: [object Object]
- `label`: [object Object]
- `value`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]

**Variants:** default

### Switch

Toggle switch for on/off states

**Props:**
- `label`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]

**Variants:** default

### Badge

Small status indicator or label

**Props:**
- `size`: [object Object]
- `color`: [object Object]
- `variant`: [object Object]

**Variants:** default, outline, solid, soft

### Avatar

User profile image or initials display

**Props:**
- `alt`: [object Object]
- `src`: [object Object]
- `name`: [object Object]
- `size`: [object Object]
- `status`: [object Object]

**Variants:** image, initials, icon

### Modal

Overlay dialog for important content

**Props:**
- `size`: [object Object]
- `title`: [object Object]
- `isOpen`: [object Object]
- `onClose`: [object Object]
- `closeOnOverlayClick`: [object Object]

**Variants:** default, fullscreen

### Drawer

Slide-out panel from screen edge

**Props:**
- `size`: [object Object]
- `isOpen`: [object Object]
- `onClose`: [object Object]
- `placement`: [object Object]

**Variants:** left, right, top, bottom

### Popover

Floating content triggered by user interaction

**Props:**
- `offset`: [object Object]
- `trigger`: [object Object]
- `placement`: [object Object]
- `closeOnEsc`: [object Object]

**Variants:** default, tooltip

### Alert

Status messages for user feedback

**Props:**
- `title`: [object Object]
- `status`: [object Object]
- `onClose`: [object Object]
- `description`: [object Object]
- `dismissible`: [object Object]

**Variants:** info, success, warning, error

### Toast

Temporary notification messages

**Props:**
- `title`: [object Object]
- `status`: [object Object]
- `duration`: [object Object]
- `isClosable`: [object Object]
- `description`: [object Object]

**Variants:** info, success, warning, error

### Spinner

Loading indicator

**Props:**
- `size`: [object Object]
- `color`: [object Object]
- `speed`: [object Object]

**Variants:** default, dots, pulse

### ProgressBar

Progress indicator for tasks

**Props:**
- `max`: [object Object]
- `color`: [object Object]
- `value`: [object Object]
- `isIndeterminate`: [object Object]

**Variants:** linear, circular

### Skeleton

Placeholder for loading content

**Props:**
- `lines`: [object Object]
- `width`: [object Object]
- `height`: [object Object]
- `variant`: [object Object]

**Variants:** text, circle, rectangle

### Navbar

Primary navigation header

**Props:**
- `logo`: [object Object]
- `items`: [object Object]
- `sticky`: [object Object]
- `actions`: [object Object]

**Variants:** default, sticky, transparent

### Sidebar

Side navigation panel

**Props:**
- `items`: [object Object]
- `overlay`: [object Object]
- `collapsed`: [object Object]
- `collapsible`: [object Object]

**Variants:** default, mini, overlay

### Tabs

Tabbed navigation component

**Props:**
- `size`: [object Object]
- `items`: [object Object]
- `variant`: [object Object]
- `activeIndex`: [object Object]

**Variants:** line, enclosed, soft-rounded

### Breadcrumbs

Hierarchical navigation trail

**Props:**
- `items`: [object Object]
- `maxItems`: [object Object]
- `separator`: [object Object]

**Variants:** default, slash, chevron

### Pagination

Navigation for paginated content

**Props:**
- `totalPages`: [object Object]
- `currentPage`: [object Object]
- `onPageChange`: [object Object]
- `siblingCount`: [object Object]
- `showFirstLast`: [object Object]

**Variants:** default, simple, compact

### DataTable

Data table with sorting and filtering

**Props:**
- `data`: [object Object]
- `columns`: [object Object]
- `sortable`: [object Object]
- `selection`: [object Object]
- `filterable`: [object Object]
- `pagination`: [object Object]

**Variants:** default, striped, bordered

### List

Vertical list of items

**Props:**
- `items`: [object Object]
- `ordered`: [object Object]
- `spacing`: [object Object]
- `dividers`: [object Object]

**Variants:** default, ordered, unordered, description

### Tag

Removable keyword labels

**Props:**
- `color`: [object Object]
- `label`: [object Object]
- `onRemove`: [object Object]
- `removable`: [object Object]

**Variants:** solid, outline, ghost

### Accordion

Collapsible content sections

**Props:**
- `items`: [object Object]
- `defaultIndex`: [object Object]
- `allowMultiple`: [object Object]

**Variants:** default, multiple, ghost

### Slider

Range input slider control

**Props:**
- `max`: [object Object]
- `min`: [object Object]
- `step`: [object Object]
- `marks`: [object Object]
- `value`: [object Object]

**Variants:** single, range

### Divider

Visual separator element

**Props:**
- `variant`: [object Object]
- `orientation`: [object Object]

**Variants:** horizontal, vertical

### Tooltip

Contextual help information

**Props:**
- `delay`: [object Object]
- `label`: [object Object]
- `hasArrow`: [object Object]
- `placement`: [object Object]

**Variants:** default, arrow

### FilterSidebar

Specialized sidebar for product filtering

**Props:**
- `filters`: [object Object]
- `onClearAll`: [object Object]
- `appliedFilters`: [object Object]
- `onFilterChange`: [object Object]

**Variants:** default, collapsible

### ViewToggle

Toggle between grid and list views

**Props:**
- `view`: [object Object]
- `onViewChange`: [object Object]

**Variants:** default

### SortSelect

Dropdown for sorting options

**Props:**
- `value`: [object Object]
- `options`: [object Object]
- `onChange`: [object Object]
- `placeholder`: [object Object]

**Variants:** default

### Container

Layout container with responsive max-widths

**Props:**
- `size`: [object Object]
- `centerContent`: [object Object]

**Variants:** default, fluid

### Grid

CSS Grid layout system

**Props:**
- `gap`: [object Object]
- `rows`: [object Object]
- `columns`: [object Object]

**Variants:** default, responsive

### Stack

Flexbox layout for stacking elements

**Props:**
- `align`: [object Object]
- `justify`: [object Object]
- `spacing`: [object Object]
- `direction`: [object Object]

**Variants:** vertical, horizontal

