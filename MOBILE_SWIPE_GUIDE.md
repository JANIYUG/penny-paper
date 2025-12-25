# Mobile Swipe Navigation Guide

## Overview
Penny & Paper now features a modern **horizontal swipe interface** for mobile devices (screens < 768px), providing an app-like experience similar to Instagram stories or onboarding flows.

## Page Behaviors

### 🔄 Dashboard (index.html) - HORIZONTAL SWIPE
- **Navigation**: Swipe left/right to navigate between dashboard slides
- **Slides**: 4 total slides with different content:
  - **Slide 1**: Daily & Weekly spending cards with progress rings
  - **Slide 2**: Monthly & Yearly spending cards with progress rings
  - **Slide 3**: Top Category, Transactions, and Month Glance cards
  - **Slide 4**: Savings and Recent Transactions cards
- **Scroll Behavior**: Horizontal only, no vertical scrolling
- **Snap Points**: Each slide snaps into place when you stop swiping
- **Touch Gestures**: Smooth momentum scrolling with scroll-snap

### 📊 Reports & Analysis (r&p.html) - VERTICAL SCROLL
- **Navigation**: Normal vertical scrolling
- **Layout**: Single column, full-width charts and stats
- **Scroll Behavior**: Vertical only, no horizontal scrolling
- **Content**: All analytics, charts, and filters scroll vertically

### 📝 Notes (notes.html) - VERTICAL SCROLL
- **Navigation**: Normal vertical scrolling
- **Layout**: Single column grid of note cards
- **Scroll Behavior**: Vertical only
- **Height**: `calc(100vh - 140px)` for header space

### ➕ Add Expense (add-expense.html) - VERTICAL SCROLL
- **Navigation**: Normal vertical scrolling
- **Layout**: Form fields stack vertically
- **Scroll Behavior**: Vertical only
- **Height**: `calc(100vh - 60px)` for navigation bar

## Technical Implementation

### CSS Properties Used

#### Dashboard Swiper
```css
.dashboard-swiper {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;  /* Snap to slides */
  -webkit-overflow-scrolling: touch;  /* iOS momentum */
  scrollbar-width: none;  /* Hide scrollbar */
}

.dash-slide {
  flex: 0 0 100%;  /* Each slide takes full width */
  scroll-snap-align: start;  /* Snap to start of slide */
  scroll-snap-stop: always;  /* Stop at each slide */
}
```

#### Other Pages (Vertical Scroll)
```css
.report-main,
.notes-grid,
.add-expense-container {
  overflow-y: auto !important;  /* Allow vertical scroll */
  overflow-x: hidden !important;  /* Block horizontal scroll */
  -webkit-overflow-scrolling: touch;  /* Smooth iOS scrolling */
}
```

### HTML Structure

#### Dashboard (Before)
```html
<div class="dashboard">
  <div class="card-row row-2">
    <div class="card">...</div>
    <div class="card">...</div>
  </div>
  <!-- More rows -->
</div>
```

#### Dashboard (After)
```html
<div class="dashboard">
  <div class="dashboard-swiper">
    <div class="dash-slide">
      <div class="card">...</div>
      <div class="card">...</div>
    </div>
    <div class="dash-slide">
      <div class="card">...</div>
      <div class="card">...</div>
    </div>
    <!-- More slides -->
  </div>
</div>
```

## Design Decisions

### Why Horizontal Swipe for Dashboard?
1. **App-like Feel**: Modern mobile apps use horizontal navigation
2. **Content Organization**: Groups related spending periods together
3. **Touch-Friendly**: Natural swipe gesture for mobile users
4. **No Vertical Scroll**: Prevents accidental scrolling conflicts
5. **Visual Focus**: One slide at a time reduces cognitive load

### Why Vertical Scroll for Reports?
1. **Data Density**: Analytics require more vertical space
2. **Chart Display**: Charts need full width without horizontal scroll
3. **Reading Pattern**: Users expect to scroll down for detailed data
4. **Filter Access**: Keep filters at top, content scrolls below

### Sidebar Behavior
- **Overlay System**: Sidebar slides in from left with smooth transition
- **Auto-Close**: Automatically closes when navigating to any page
- **Touch-Friendly**: Large hamburger icon (36x36px) for easy tapping
- **No Scroll Block**: Sidebar never blocks main content scrolling

## Mobile Optimization

### Compact Sizing
- **Navigation Bar**: 50px height
- **Donut Charts**: 90px diameter (ultra-compact)
- **Card Padding**: 8-10px for swiper slides
- **Gap Between Cards**: 10px vertical spacing
- **Typography**: 
  - Card titles: 10px
  - Card values: 18px
  - Small text: 10px

### Touch Targets
- **Hamburger Menu**: 36x36px
- **Buttons**: Minimum 44x44px per Apple guidelines
- **Card Interactions**: Full card area is tappable

### Performance
- **CSS Animations**: GPU-accelerated transforms
- **Scroll Snap**: Native browser feature (no JS)
- **No JavaScript Scroll**: Pure CSS implementation
- **Image Optimization**: `background-size: contain` for donuts

## Browser Compatibility

### Supported Features
- ✅ **scroll-snap-type**: All modern browsers (Chrome 69+, Safari 11+, Firefox 68+)
- ✅ **-webkit-overflow-scrolling**: iOS Safari optimization
- ✅ **scrollbar-width: none**: Firefox, Chrome 89+
- ✅ **::-webkit-scrollbar**: Chrome, Safari, Edge

### Fallback Behavior
- Older browsers: Still swipeable, just no snap points
- Desktop: Standard layout (no swiper needed, uses `@media (max-width: 768px)`)

## Testing Checklist

### Dashboard Swipe
- [ ] Can swipe left/right between all 4 slides
- [ ] Each slide snaps into place on release
- [ ] No vertical scrolling on dashboard
- [ ] Progress rings are 90px and crisp
- [ ] All card content is readable

### Reports Page
- [ ] Scrolls vertically without issues
- [ ] No horizontal overflow or scrolling
- [ ] Charts display full-width
- [ ] Filters stay accessible at top

### Sidebar
- [ ] Opens smoothly with hamburger tap
- [ ] Closes when tapping overlay
- [ ] Auto-closes when navigating to page
- [ ] Never blocks content scrolling

### Cross-Device
- [ ] iPhone SE (375x667)
- [ ] iPhone 12/13 (390x844)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] Google Pixel 5 (393x851)

## Troubleshooting

### Issue: Slides don't snap
**Solution**: Check `scroll-snap-type: x mandatory` is applied to `.dashboard-swiper`

### Issue: Can't swipe on dashboard
**Solution**: Verify `overflow-x: auto` and remove any `overflow: hidden` on parent elements

### Issue: Vertical scroll on dashboard
**Solution**: Ensure `.dash-slide` height doesn't exceed viewport height

### Issue: Horizontal scroll on reports
**Solution**: Check all elements have `max-width: 100%` and `box-sizing: border-box`

### Issue: Donuts are blurry
**Solution**: Verify `background-size: contain` and `image-rendering: crisp-edges`

## Future Enhancements

### Potential Features
- [ ] Swipe indicators (dots at bottom showing slide position)
- [ ] Pull-to-refresh on dashboard
- [ ] Gesture hints for first-time users
- [ ] Landscape mode optimization
- [ ] Slide transition animations
- [ ] Swipe velocity detection

### Analytics Ideas
- [ ] Track which slides users view most
- [ ] Monitor swipe patterns
- [ ] Measure time spent per slide

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Compatible With**: iOS 11+, Android 5+, Modern Browsers
