# Design Document: Metin2 Dev Toolkit UI/UX Enhancements

## Overview

This design document specifies the implementation of three UI/UX enhancements for the Metin2 Dev Toolkit:

1. **Live Statistics Sparkline**: A compact SVG line chart displaying 24-hour online player count trends on the Dashboard
2. **Module Status Indicators**: Dynamic indicators showing last-used timestamps for each module card
3. **Dark Mode Variants**: Alternative theme options ("OLED Black" and "Midnight Blue") alongside the existing "Cyber Green" theme

The implementation leverages React 18, Tailwind CSS, and localStorage for persistence, with optional database integration for historical data.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Component                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Sparkline Card  │  │  Module Cards    │                 │
│  │  (Online Stats)  │  │  + Indicators    │                 │
│  └──────────────────┘  └──────────────────┘                 │
│         │                       │                            │
│         └───────────┬───────────┘                            │
│                     │                                        │
│              ┌──────▼──────┐                                 │
│              │ AppContext  │                                 │
│              │ (Theme)     │                                 │
│              └──────┬──────┘                                 │
│                     │                                        │
│         ┌───────────┴───────────┐                            │
│         │                       │                            │
│    ┌────▼────┐          ┌──────▼──────┐                     │
│    │localStorage│        │ Database    │                     │
│    │(Sparkline  │        │(Player Data)│                     │
│    │ Timestamps)│        │             │                     │
│    └───────────┘        └─────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Sparkline Data Flow:**
1. Dashboard mounts → Load sparkline data from localStorage
2. If data incomplete → Query database for missing hours
3. Every 5 minutes → Fetch latest player count from database
4. Update localStorage with new data point (maintain 24-point window)
5. Re-render sparkline with updated data

**Module Indicator Data Flow:**
1. Dashboard mounts → Load module usage timestamps from localStorage
2. User clicks module card → Update timestamp in localStorage
3. Module indicator re-renders with new "last used" time
4. Tooltip displays full timestamp on hover

**Theme Data Flow:**
1. App starts → Load theme from localStorage (default: "cyber-green")
2. User opens Settings Modal → Display three theme options
3. User selects theme → Update AppContext + localStorage
4. All components re-render with new theme colors
5. CSS custom properties override Tailwind colors

---

## Components and Interfaces

### 1. Sparkline Component

**Location:** `src/components/Dashboard/Sparkline.js`

**Props:**
```javascript
{
  data: Array<{ hour: string, count: number }>,  // 24 data points
  loading: boolean,
  error: string | null,
  onRefresh: () => void
}
```

**Responsibilities:**
- Render SVG line chart with 24 data points
- Calculate Y-axis scale based on max player count
- Display tooltip on hover with hour and player count
- Show error state (gray color + message) when database unavailable
- Animate new data points when updated

**Key Features:**
- SVG-based rendering (no external charting library)
- Responsive width (scales with container)
- Fixed height: 120px
- Hover tooltip with smooth positioning
- Color: cyber-green (#00FF7F) default, vivid-blue (#0080FF) on hover
- Performance: Render time < 50ms

**SVG Rendering Logic:**
```
1. Calculate viewBox dimensions (width: 24 * pointSpacing, height: 120)
2. For each data point:
   - X position: index * pointSpacing
   - Y position: 120 - (count / maxCount * 100)
3. Draw polyline connecting all points
4. Draw circles at each point for hover detection
5. Render tooltip on mouseover
```

### 2. Module Status Indicator Component

**Location:** `src/components/Dashboard/ModuleIndicator.js`

**Props:**
```javascript
{
  moduleId: string,
  moduleName: string,
  lastUsed: number | null  // Unix timestamp
}
```

**Responsibilities:**
- Display "Last used: X hours ago" or "Last used: X minutes ago"
- Show "Never used" if no timestamp exists
- Color-code based on time elapsed:
  - < 1 hour: cyber-green
  - 1-24 hours: vivid-blue
  - > 24 hours: text-muted
- Display full timestamp in tooltip on hover
- Update in real-time as time passes

**Key Features:**
- Max width: 30px (compact)
- Positioned at top-right of module card
- Tooltip format: "2024-01-15 14:30:45"
- Performance: Render time < 10ms
- Updates every minute (useEffect with interval)

### 3. Theme Provider Component

**Location:** `src/context/ThemeContext.js`

**Context Value:**
```javascript
{
  theme: 'cyber-green' | 'oled-black' | 'midnight-blue',
  setTheme: (theme: string) => void,
  colors: {
    darkBg: string,
    darkSurface: string,
    darkBorder: string,
    darkHover: string,
    accentPrimary: string,
    accentSecondary: string
  }
}
```

**Responsibilities:**
- Manage global theme state
- Persist theme to localStorage
- Provide color palette for all components
- Apply CSS custom properties for dynamic theming
- Sync theme across all open windows (Electron)

**Theme Definitions:**

| Theme | Dark BG | Dark Surface | Accent Primary | Accent Secondary |
|-------|---------|--------------|-----------------|------------------|
| Cyber Green | #0F0F0F | #1A1A1A | #00FF7F | #0080FF |
| OLED Black | #000000 | #0D0D0D | #00FF7F | #0080FF |
| Midnight Blue | #0A1428 | #132A4A | #0080FF | #00D4FF |

### 4. Settings Modal Enhancement

**Location:** `src/components/Settings/SettingsModal.js` (existing, enhanced)

**New Section: Theme Selection**
```javascript
<div className="theme-selector">
  <h3>Theme</h3>
  <div className="theme-options">
    {['cyber-green', 'oled-black', 'midnight-blue'].map(theme => (
      <ThemeOption
        key={theme}
        theme={theme}
        selected={currentTheme === theme}
        onSelect={setTheme}
        preview={<ThemePreview theme={theme} />}
      />
    ))}
  </div>
</div>
```

---

## Data Models

### Sparkline Data Structure

**localStorage key:** `sparklineData`

```javascript
{
  lastUpdated: number,  // Unix timestamp of last update
  points: [
    {
      hour: "2024-01-15T14:00:00Z",
      count: 245,
      source: 'database' | 'cached'
    },
    // ... 23 more points
  ]
}
```

**Database Table (optional, for historical analysis):**
```sql
CREATE TABLE player_count_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hour DATETIME NOT NULL UNIQUE,
  player_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Module Usage Data Structure

**localStorage key:** `moduleUsage`

```javascript
{
  'shop-manager': 1705334445000,      // Unix timestamp
  'proto-editor': 1705330845000,
  'quest-generator': null,             // Never used
  'map-tool': 1705248000000,
  'ui-tools': 1705334445000,
  'log-analyzer': 1705334445000
}
```

### Theme Configuration

**localStorage key:** `appTheme`

```javascript
'cyber-green' | 'oled-black' | 'midnight-blue'
```

**AppContext storage:**
```javascript
{
  theme: string,
  colors: {
    darkBg: string,
    darkSurface: string,
    darkBorder: string,
    darkHover: string,
    textPrimary: string,
    textSecondary: string,
    textMuted: string,
    accentPrimary: string,
    accentSecondary: string,
    danger: string,
    warning: string,
    success: string
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sparkline Data Window Invariant

*For any sequence of sparkline data updates, the sparkline SHALL maintain exactly 24 data points, with the oldest point removed when a new point is added.*

**Validates: Requirements 1.2, 1.6**

**Rationale:** This property ensures the 24-hour sliding window is preserved across all update operations. Testing with various update sequences (rapid updates, gaps, boundary conditions) verifies the invariant holds.

### Property 2: Sparkline Point Width Equality

*For any sparkline rendering with N data points (N ≤ 24), all points SHALL have equal horizontal spacing.*

**Validates: Requirements 1.6**

**Rationale:** This property verifies the visual consistency of the sparkline. Generated data with varying point counts should always render with uniform spacing.

### Property 3: Module Timestamp Persistence

*For any module that is opened, its Last_Used_Timestamp SHALL be updated in localStorage and remain consistent across app restarts.*

**Validates: Requirements 2.2**

**Rationale:** This property ensures module usage tracking is reliable. Testing with different modules and restart scenarios verifies persistence works correctly.

### Property 4: Theme Persistence and Consistency

*For any theme selection, the selected theme SHALL be persisted to localStorage and applied consistently across all UI components without requiring a page refresh.*

**Validates: Requirements 3.2, 3.6**

**Rationale:** This property verifies theme changes are immediately applied and survive app restarts. Testing with all three themes and various component states ensures consistency.

### Property 5: Theme Color Palette Validity

*For any theme variant, all color values in the palette SHALL be valid hex colors and the contrast ratio between text and background SHALL meet WCAG AA standards (4.5:1 for normal text).*

**Validates: Requirements 3.4, 3.5**

**Rationale:** This property ensures theme definitions are valid and accessible. Testing with generated color combinations verifies palette integrity.

---

## Error Handling

### Sparkline Error Scenarios

| Scenario | Handling |
|----------|----------|
| Database connection fails | Show gray sparkline with "Veri Alınamıyor" message |
| localStorage corrupted | Clear data and fetch from database |
| Missing hours in 24-hour window | Fetch from database, fill gaps with 0 or "N/A" |
| Invalid data points (negative counts) | Filter out, log warning |
| Network timeout on data fetch | Retry with exponential backoff (3 attempts) |

**Implementation:**
```javascript
try {
  const data = await fetchSparklineData();
  setSparklineData(data);
} catch (error) {
  console.error('Sparkline error:', error);
  setSparklineError('Veri Alınamıyor');
  setSparklineLoading(false);
}
```

### Module Indicator Error Scenarios

| Scenario | Handling |
|----------|----------|
| localStorage unavailable | Use in-memory state (data lost on refresh) |
| Invalid timestamp | Show "Never used" |
| Time calculation error | Fallback to "Recently used" |

### Theme Error Scenarios

| Scenario | Handling |
|----------|----------|
| Invalid theme name | Fallback to "cyber-green" |
| localStorage unavailable | Use default theme |
| CSS custom properties not supported | Fallback to Tailwind classes |

---

## Testing Strategy

### Unit Tests (Example-Based)

**Sparkline Component:**
- Renders with 24 data points
- Displays tooltip with correct hour and count on hover
- Shows error state when database unavailable
- Loads data from localStorage on mount
- Updates data every 5 minutes

**Module Indicator:**
- Displays "Last used: X hours ago" format
- Shows "Never used" when no timestamp
- Color-codes correctly (green < 1h, blue 1-24h, muted > 24h)
- Displays full timestamp in tooltip
- Updates every minute

**Theme System:**
- Loads theme from localStorage on app start
- Persists theme selection to localStorage
- Applies theme colors to all components
- Switches between themes without page refresh
- Displays theme preview on hover

### Property-Based Tests

**Property 1: Sparkline Data Window Invariant**
- Generate random sequences of data updates
- Verify point count always equals 24 (or less initially)
- Verify oldest point is removed when new point added
- Test with rapid updates, gaps, boundary conditions
- Minimum 100 iterations

**Property 2: Sparkline Point Width Equality**
- Generate sparkline data with 1-24 points
- Render sparkline for each dataset
- Verify all points have equal horizontal spacing
- Test with various container widths
- Minimum 100 iterations

**Property 3: Module Timestamp Persistence**
- Generate random module IDs and timestamps
- Update module usage in localStorage
- Simulate app restart (clear state, reload from localStorage)
- Verify timestamp persists correctly
- Test with all 6 modules
- Minimum 100 iterations

**Property 4: Theme Persistence and Consistency**
- Generate random theme selections
- Apply theme and verify all components update
- Simulate app restart
- Verify theme persists and applies correctly
- Test with all 3 themes
- Minimum 100 iterations

**Property 5: Theme Color Palette Validity**
- Verify all theme color values are valid hex colors
- Calculate contrast ratios for text/background combinations
- Verify WCAG AA compliance (4.5:1 for normal text)
- Test with all 3 themes
- Minimum 100 iterations

### Integration Tests

- Sparkline updates with real database queries
- Module indicators update when modules are opened
- Theme changes persist across app restart
- All components render correctly with each theme
- localStorage and database stay in sync

### Performance Tests

- Sparkline render time < 50ms
- Module indicator render time < 10ms
- Theme change propagation < 100ms
- Data update interval: 5 minutes (configurable)

---

## Implementation Considerations

### Performance Optimizations

1. **Sparkline Rendering:**
   - Use React.memo to prevent unnecessary re-renders
   - Debounce hover events (50ms)
   - Cache SVG path calculations
   - Lazy-load tooltip component

2. **Module Indicators:**
   - Use useCallback for time formatting
   - Update only when timestamp changes (not every minute)
   - Batch updates with requestAnimationFrame

3. **Theme System:**
   - Use CSS custom properties for dynamic theming
   - Batch DOM updates when theme changes
   - Avoid re-rendering entire app tree (use context selectively)

### Browser/Electron Compatibility

- SVG support: All modern browsers + Electron
- localStorage: Available in Electron (persistent)
- CSS custom properties: Supported in all modern browsers
- Tailwind CSS: Already in use, no compatibility issues

### Accessibility Considerations

- Sparkline: Provide data table alternative for screen readers
- Module indicators: Include aria-label with full timestamp
- Theme selection: Ensure sufficient color contrast
- Tooltips: Use role="tooltip" and aria-describedby

### Internationalization (i18n)

All user-facing strings must support LanguageContext:
- "Last used: X hours ago" → Translated
- "Never used" → Translated
- "Veri Alınamıyor" → Already Turkish, add English translation
- Theme names: "Cyber Green", "OLED Black", "Midnight Blue" → Translated
- Tooltip formats: Respect locale for date/time display

---

## Tailwind CSS Configuration Updates

**New color definitions for tailwind.config.js:**

```javascript
colors: {
  // Existing colors
  'cyber-green': '#00FF7F',
  'vivid-blue': '#0080FF',
  'dark-bg': '#0F0F0F',
  'dark-surface': '#1A1A1A',
  'dark-border': '#2A2A2A',
  'dark-hover': '#333333',
  'text-primary': '#FFFFFF',
  'text-secondary': '#B0B0B0',
  'text-muted': '#666666',
  'danger': '#FF4444',
  'warning': '#FFB800',
  'success': '#00FF7F',
  
  // Theme variants (CSS custom properties)
  'theme-bg': 'var(--theme-bg, #0F0F0F)',
  'theme-surface': 'var(--theme-surface, #1A1A1A)',
  'theme-border': 'var(--theme-border, #2A2A2A)',
  'theme-hover': 'var(--theme-hover, #333333)',
  'theme-accent-primary': 'var(--theme-accent-primary, #00FF7F)',
  'theme-accent-secondary': 'var(--theme-accent-secondary, #0080FF)',
}
```

**CSS custom properties (in index.css):**

```css
:root {
  /* Cyber Green (default) */
  --theme-bg: #0F0F0F;
  --theme-surface: #1A1A1A;
  --theme-border: #2A2A2A;
  --theme-hover: #333333;
  --theme-accent-primary: #00FF7F;
  --theme-accent-secondary: #0080FF;
}

[data-theme="oled-black"] {
  --theme-bg: #000000;
  --theme-surface: #0D0D0D;
  --theme-border: #1A1A1A;
  --theme-hover: #262626;
  --theme-accent-primary: #00FF7F;
  --theme-accent-secondary: #0080FF;
}

[data-theme="midnight-blue"] {
  --theme-bg: #0A1428;
  --theme-surface: #132A4A;
  --theme-border: #1B3A5C;
  --theme-hover: #2A4A6C;
  --theme-accent-primary: #0080FF;
  --theme-accent-secondary: #00D4FF;
}
```

---

## File Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.js (enhanced)
│   │   ├── Sparkline.js (new)
│   │   └── ModuleIndicator.js (new)
│   └── Settings/
│       └── SettingsModal.js (enhanced)
├── context/
│   ├── AppContext.js (enhanced with theme)
│   ├── LanguageContext.js (existing)
│   └── ThemeContext.js (new)
├── hooks/
│   └── useTheme.js (new)
├── utils/
│   ├── database.js (existing)
│   └── sparklineUtils.js (new)
└── styles/
    └── themes.css (new)
```

---

## Dependencies

**No new external dependencies required:**
- React 18 (existing)
- Tailwind CSS (existing)
- lucide-react (existing, for icons)
- Electron (existing, for localStorage)

**Optional enhancements:**
- date-fns: For advanced date formatting (if needed)
- recharts: For advanced sparkline features (if needed later)

---

## Migration Path

1. **Phase 1:** Implement Sparkline component (standalone)
2. **Phase 2:** Implement Module Indicators (integrate with Dashboard)
3. **Phase 3:** Implement Theme System (global, affects all components)
4. **Phase 4:** Testing and optimization
5. **Phase 5:** Documentation and release

---

## Success Criteria

- ✅ Sparkline renders with 24 data points, updates every 5 minutes
- ✅ Module indicators show last-used time with color-coding
- ✅ Three theme variants available and persist across restarts
- ✅ All components render correctly with each theme
- ✅ Performance: Sparkline < 50ms, Indicators < 10ms, Theme change < 100ms
- ✅ Error handling for database failures and invalid data
- ✅ Full i18n support for all new strings
- ✅ Property-based tests verify data invariants
- ✅ Unit tests cover all UI interactions
- ✅ Integration tests verify persistence and theme application
