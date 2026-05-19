// MOBILE TYPOGRAPHY FIXES FOR APP.JSX

// REPLACE THIS:
<h1 className="text-2xl sm:text-4xl font-semibold truncate">

// WITH THIS:
<h1
  className="font-semibold truncate"
  style={{
    fontSize: isMobile ? "2.5rem" : "4rem",
    lineHeight: 1
  }}
>

// REPLACE THIS:
<p className="text-teal-300 text-xs sm:text-sm uppercase tracking-[0.25em] truncate">

// WITH THIS:
<p
  className="text-teal-300 uppercase truncate"
  style={{
    fontSize: isMobile ? "1rem" : "1.1rem",
    letterSpacing: "0.25em"
  }}
>

// REPLACE BUTTON CLASS EXAMPLES LIKE:
className="h-14 rounded-2xl text-lg font-semibold transition-all"

// WITH:
className="h-14 rounded-2xl font-semibold transition-all"
style={{
  fontSize: isMobile ? "1.3rem" : "1rem"
}}
