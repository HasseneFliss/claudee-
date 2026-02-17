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

### SearchInput
Specialized search input with autocomplete dropdown

**Props:**
- `loading`: [object Object]
- `onSearch`: [object Object]
- `placeholder`: [object Object]
- `suggestions`: [object Object]
- `showSuggestions`: [object Object]

### Card
Container component for grouping related content

**Props:**
- `size`: [object Object]
- `padding`: [object Object]
- `variant`: [object Object]
- `clickable`: [object Object]

### ProductCard
Specialized card for displaying product information

**Props:**
- `product`: [object Object]
- `onWishlist`: [object Object]
- `onAddToCart`: [object Object]
- `showQuickView`: [object Object]

### Select
Dropdown select input for choosing from options

**Props:**
- `value`: [object Object]
- `options`: [object Object]
- `multiple`: [object Object]
- `searchable`: [object Object]
- `placeholder`: [object Object]

### Checkbox
Checkbox input for boolean selections

**Props:**
- `label`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]
- `indeterminate`: [object Object]

### RadioButton
Radio button for single selection from group

**Props:**
- `name`: [object Object]
- `label`: [object Object]
- `value`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]

### Switch
Toggle switch for on/off states

**Props:**
- `label`: [object Object]
- `checked`: [object Object]
- `disabled`: [object Object]

### Badge
Small status indicator or label

**Props:**
- `size`: [object Object]
- `color`: [object Object]
- `variant`: [object Object]

### Avatar
User profile image or initials display

**Props:**
- `alt`: [object Object]
- `src`: [object Object]
- `name`: [object Object]
- `size`: [object Object]
- `status`: [object Object]

### Modal
Overlay dialog for important content

**Props:**
- `size`: [object Object]
- `title`: [object Object]
- `isOpen`: [object Object]
- `onClose`: [object Object]
- `closeOnOverlayClick`: [object Object]

### Drawer
Slide-out panel from screen edge

**Props:**
- `size`: [object Object]
- `isOpen`: [object Object]
- `onClose`: [object Object]
- `placement`: [object Object]

### Popover
Floating content triggered by user interaction

**Props:**
- `offset`: [object Object]
- `trigger`: [object Object]
- `placement`: [object Object]
- `closeOnEsc`: [object Object]

### Alert
Status messages for user feedback

**Props:**
- `title`: [object Object]
- `status`: [object Object]
- `onClose`: [object Object]
- `description`: [object Object]
- `dismissible`: [object Object]

### Toast
Temporary notification messages

**Props:**
- `title`: [object Object]
- `status`: [object Object]
- `duration`: [object Object]
- `isClosable`: [object Object]
- `description`: [object Object]

### Spinner
Loading indicator

**Props:**
- `size`: [object Object]
- `color`: [object Object]
- `speed`: [object Object]

### ProgressBar
Progress indicator for tasks

**Props:**
- `max`: [object Object]
- `color`: [object Object]
- `value`: [object Object]
- `isIndeterminate`: [object Object]

### Skeleton
Placeholder for loading content

**Props:**
- `lines`: [object Object]
- `width`: [object Object]
- `height`: [object Object]
- `variant`: [object Object]

### Navbar
Primary navigation header

**Props:**
- `logo`: [object Object]
- `items`: [object Object]
- `sticky`: [object Object]
- `actions`: [object Object]

### Sidebar
Side navigation panel

**Props:**
- `items`: [object Object]
- `overlay`: [object Object]
- `collapsed`: [object Object]
- `collapsible`: [object Object]

### Tabs
Tabbed navigation component

**Props:**
- `size`: [object Object]
- `items`: [object Object]
- `variant`: [object Object]
- `activeIndex`: [object Object]

### Breadcrumbs
Hierarchical navigation trail

**Props:**
- `items`: [object Object]
- `maxItems`: [object Object]
- `separator`: [object Object]

### Pagination
Navigation for paginated content

**Props:**
- `totalPages`: [object Object]
- `currentPage`: [object Object]
- `onPageChange`: [object Object]
- `siblingCount`: [object Object]
- `showFirstLast`: [object Object]

### DataTable
Data table with sorting and filtering

**Props:**
- `data`: [object Object]
- `columns`: [object Object]
- `sortable`: [object Object]
- `selection`: [object Object]
- `filterable`: [object Object]
- `pagination`: [object Object]

### List
Vertical list of items

**Props:**
- `items`: [object Object]
- `ordered`: [object Object]
- `spacing`: [object Object]
- `dividers`: [object Object]

### Tag
Removable keyword labels

**Props:**
- `color`: [object Object]
- `label`: [object Object]
- `onRemove`: [object Object]
- `removable`: [object Object]

### Accordion
Collapsible content sections

**Props:**
- `items`: [object Object]
- `defaultIndex`: [object Object]
- `allowMultiple`: [object Object]

### Slider
Range input slider control

**Props:**
- `max`: [object Object]
- `min`: [object Object]
- `step`: [object Object]
- `marks`: [object Object]
- `value`: [object Object]

### Divider
Visual separator element

**Props:**
- `variant`: [object Object]
- `orientation`: [object Object]

### Tooltip
Contextual help information

**Props:**
- `delay`: [object Object]
- `label`: [object Object]
- `hasArrow`: [object Object]
- `placement`: [object Object]

### FilterSidebar
Specialized sidebar for product filtering

**Props:**
- `filters`: [object Object]
- `onClearAll`: [object Object]
- `appliedFilters`: [object Object]
- `onFilterChange`: [object Object]

### ViewToggle
Toggle between grid and list views

**Props:**
- `view`: [object Object]
- `onViewChange`: [object Object]

### SortSelect
Dropdown for sorting options

**Props:**
- `value`: [object Object]
- `options`: [object Object]
- `onChange`: [object Object]
- `placeholder`: [object Object]

### Container
Layout container with responsive max-widths

**Props:**
- `size`: [object Object]
- `centerContent`: [object Object]

### Grid
CSS Grid layout system

**Props:**
- `gap`: [object Object]
- `rows`: [object Object]
- `columns`: [object Object]

### Stack
Flexbox layout for stacking elements

**Props:**
- `align`: [object Object]
- `justify`: [object Object]
- `spacing`: [object Object]
- `direction`: [object Object]

