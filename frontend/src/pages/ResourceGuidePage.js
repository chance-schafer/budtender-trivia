import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    TextField,
    Box,
    List,
    ListItem,
    ListItemText,
    Paper,
    Link as MuiLink,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug'; // Import rehype-slug
// Removed useTheme as we'll use Tailwind classes directly

// --- Paste the Markdown Content Here ---
// const markdownContent = `... your very large markdown string ...`;
// --- End Markdown Content ---

// --- Corrected Table of Contents Data ---
// These IDs should now match what rehype-slug generates by default
const tocItems = [
    { title: "Cannabis Science Fundamentals", id: "cannabis-science-fundamentals" },
    { title: "Plant Anatomy", id: "plant-anatomy" },
    { title: "Classification", id: "classification" },
    { title: "Basic Cultivation Concepts", id: "basic-cultivation-concepts" },
    { title: "Extraction Methods", id: "extraction-methods" },
    { title: "Products & Consumption Methods", id: "products-consumption-methods" }, // Corrected ID
    { title: "Physiology & Effects", id: "physiology-effects" }, // Corrected ID
    { title: "Customer Service & Sales Techniques", id: "customer-service-sales-techniques" }, // Corrected ID
    { title: "Compliance, Safety & Regulations", id: "compliance-safety-regulations" }, // Corrected ID
    { title: "Advanced Quality Assessment", id: "advanced-quality-assessment" },
    { title: "Troubleshooting Common Issues", id: "troubleshooting-common-issues" },
    { title: "Cannabis History", id: "cannabis-history" },
    { title: "Emerging Trends", id: "emerging-trends" },
    { title: "Legal Nuances & Social Equity", id: "legal-nuances-social-equity" }, // Corrected ID
];
// --- End TOC Data ---

// Simple debounce function (keep as before)
function debounce(func, wait) {
    let timeoutId = null; // Variable to store the timeout ID

    // The debounced function
    const debouncedFunc = function executedFunction(...args) {
        // Clear the previous timeout if it exists
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        // Set a new timeout
        timeoutId = setTimeout(() => {
            timeoutId = null; // Clear the ID after execution
            func.apply(this, args); // Call the original function
        }, wait);
    };

    // Add a cancel method to the debounced function
    debouncedFunc.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debouncedFunc;
}

// --- Highlighting Function ---
// Moved outside component for clarity, wrapped in useCallback later if needed inside component scope
const highlightNode = (node, highlight) => {
    if (!highlight || !highlight.trim()) { // Added check for empty/whitespace highlight
        return node; // No highlighting needed
    }

    const processChildren = (children) => {
        return React.Children.map(children, child => {
            if (typeof child === 'string') {
                // Escape regex special characters in the highlight term
                const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedHighlight})`, 'gi');
                // Only highlight if the regex actually matches something
                if (regex.test(child)) {
                    return child.split(regex).map((part, index) =>
                        // Check if the part matches the regex (case-insensitive)
                        regex.test(part) && part.toLowerCase() === highlight.toLowerCase()
                            ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-500 dark:text-black px-0.5">{part}</mark>
                            : part
                    );
                }
                return child; // Return original string if no match
            }
            // If it's a valid React element with children, recurse
            if (React.isValidElement(child) && child.props.children) {
                 // Avoid recursing into potentially complex or non-text elements like code blocks or custom components
                 // Also check if child.type exists before accessing its properties
                 if (child.type && (child.type === 'code' || child.type === 'pre' || typeof child.props.children === 'function')) {
                    return child;
                 }
                // Ensure children are processable before cloning
                const processedChildren = processChildren(child.props.children);
                return React.cloneElement(child, {
                    ...child.props,
                    children: processedChildren
                });
            }
            // Return other nodes (like empty elements, numbers, etc.) as is
            return child;
        });
    };

    // Ensure the initial node is processable
    if (typeof node === 'string' || (React.isValidElement(node) && node.props.children)) {
        return processChildren(node);
    } else if (Array.isArray(node)) { // Handle cases where node might be an array of children directly
         return processChildren(node);
    }

    return node; // Return node if it's not highlightable
};


function ResourceGuidePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const contentRef = useRef(null);

    // Memoize the debounced function itself
    const debouncedSetSearch = useMemo(
        () => debounce(setDebouncedSearchTerm, 300),
        [] // No dependencies needed here, setDebouncedSearchTerm is stable
    );

    // Effect to call the debounced function and handle cleanup
    useEffect(() => {
        debouncedSetSearch(searchTerm);
        // Return a cleanup function that calls the cancel method
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [searchTerm, debouncedSetSearch]);


    // --- Markdown Components ---
    // Use useCallback for components dependent on debouncedSearchTerm if performance becomes an issue,
    // but useMemo is generally sufficient here as the dependency changes infrequently.
    const components = useMemo(() => ({
        // Ensure IDs from rehype-slug are passed down correctly
        h1: ({ node, children, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100" {...props}>{highlightNode(children, debouncedSearchTerm)}</h1>,
        h2: ({ node, children, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200" {...props}>{highlightNode(children, debouncedSearchTerm)}</h2>,
        h3: ({ node, children, ...props }) => <h3 className="text-xl font-semibold mt-5 mb-2 dark:text-gray-200" {...props}>{highlightNode(children, debouncedSearchTerm)}</h3>,
        p: ({ node, children, ...props }) => <p className="mb-4 leading-relaxed dark:text-gray-300" {...props}>{highlightNode(children, debouncedSearchTerm)}</p>,
        ul: ({ node, children, ...props }) => <ul className="list-disc list-inside mb-4 pl-4 space-y-1 dark:text-gray-300" {...props}>{highlightNode(children, debouncedSearchTerm)}</ul>,
        ol: ({ node, children, ...props }) => <ol className="list-decimal list-inside mb-4 pl-4 space-y-1 dark:text-gray-300" {...props}>{highlightNode(children, debouncedSearchTerm)}</ol>,
        li: ({ node, children, ...props }) => <li className="mb-1" {...props}>{highlightNode(children, debouncedSearchTerm)}</li>,
        a: ({ node, children, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>{highlightNode(children, debouncedSearchTerm)}</a>,
        strong: ({ node, children, ...props }) => <strong className="font-semibold dark:text-gray-200" {...props}>{highlightNode(children, debouncedSearchTerm)}</strong>,
        em: ({ node, children, ...props }) => <em className="italic" {...props}>{highlightNode(children, debouncedSearchTerm)}</em>,
        // Keep code block logic as is, ensure highlighting doesn't break it
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            // Apply highlighting only if it's inline code, not a block
            const highlightedChildren = inline ? highlightNode(children, debouncedSearchTerm) : children;

            return !inline && match ? (
                 // Keep existing code block rendering logic (e.g., syntax highlighting component)
                 // For simplicity, just rendering pre/code tags here
                 <pre className={`bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm ${className || ''}`} {...props}>
                     <code>{codeText}</code>
                 </pre>
            ) : (
                <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm ${inline ? 'inline' : ''} ${className || ''}`} {...props}>
                    {highlightedChildren}
                </code>
            );
        },
        // Apply highlighting to table cells
        td: ({ node, children, ...props }) => <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600" {...props}>{highlightNode(children, debouncedSearchTerm)}</td>,
        th: ({ node, children, ...props }) => <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-300 dark:border-gray-600" {...props}>{highlightNode(children, debouncedSearchTerm)}</th>,
        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border-collapse border border-gray-300 dark:border-gray-600" {...props} /></div>,
        thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900" {...props} />,
        tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800" {...props} />,
    }), [debouncedSearchTerm]);


  // --- Updated handleTocClick with Header Offset ---
  // useCallback is appropriate here as the function itself doesn't change
  const handleTocClick = useCallback((id) => (event) => {
    event.preventDefault();
    // Use try/catch for robustness in case element is not found
    try {
        const element = document.getElementById(id);
        if (element) {
            const headerHeight = 64; // Height of the sticky header (adjust if needed)
            const extraPadding = 20; // Add a little extra space below the header
            const offset = headerHeight + extraPadding;

            const elementPosition = element.getBoundingClientRect().top + window.scrollY; // More reliable position calculation
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn(`TOC Click: Element with ID '${id}' not found.`);
            // Optional: Fallback using querySelector if needed, though IDs should be reliable now
            // const elementByQuery = document.querySelector(`[id="${CSS.escape(id)}"]`); // Use CSS.escape for complex IDs
            // if (elementByQuery) { /* ... scroll logic ... */ }
        }
    } catch (error) {
        console.error("Error scrolling to element:", error);
    }
 }, []); // Empty dependency array is correct

    // --- JSX Return ---
    return (
        // Added dark mode classes to container if needed, assuming handled globally
        <Container maxWidth="lg" className="flex flex-col md:flex-row gap-6 md:gap-8 mt-4 mb-4">
            {/* Sidebar */}
            <Paper
                elevation={2}
                // Ensure sidebar scrolls independently and doesn't exceed viewport height
                className="w-full md:w-64 lg:w-72 flex-shrink-0 p-4 sticky top-[calc(theme(space.16)+theme(space.4))] /* Adjust top based on actual header height + desired gap */ self-start hidden md:block max-h-[calc(100vh-theme(space.16)-theme(space.8))] /* Adjust max-h based on header height + top/bottom gaps */ overflow-y-auto dark:bg-gray-800"
            >
                 <Typography variant="h6" className="!mb-3 !font-semibold dark:text-gray-200 border-b pb-2 border-gray-300 dark:border-gray-700">Contents</Typography>
                <List dense component="nav" aria-label="Table of contents">
                    {tocItems.map((item) => (
                        <ListItem key={item.id} disablePadding className="mb-0.5">
                            {/* Use ButtonBase or ListItemButton for better accessibility/hover effects */}
                            <MuiLink
                                href={`#${item.id}`}
                                onClick={handleTocClick(item.id)}
                                underline="hover" // Consistent underline behavior
                                className="!text-sm !text-gray-700 dark:!text-gray-300 hover:!text-blue-600 dark:hover:!text-blue-400 w-full block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" // Added padding/hover styles
                            >
                                {/* Removed ListItemText for simpler structure, Link text is sufficient */}
                                {item.title}
                            </MuiLink>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Main Content Area */}
            <Box component="main" className="flex-grow min-w-0"> {/* Use main tag for semantics */}
                 <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search Guide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search Resource Guide" // Accessibility
                    InputProps={{
                        startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ),
                        className: "dark:bg-gray-700 dark:text-gray-200 dark:[&>fieldset]:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500" // Added focus ring
                    }}
                    className="mb-6 sticky top-16 z-10 bg-white dark:bg-gray-900 py-2" // Make search sticky below header
                />
                {/* Removed Box wrapper around ReactMarkdown, apply prose classes directly if needed or via parent */}
                <article ref={contentRef} className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none"> {/* Use article tag */}
                    <ReactMarkdown
                        components={components}
                        rehypePlugins={[rehypeRaw, rehypeSlug]}
                        // Ensure markdownContent is passed correctly
                        // children={markdownContent} // Use children prop for content
                    >
                        {markdownContent /* Pass content as children */}
                    </ReactMarkdown>
                </article>
            </Box>
        </Container>
    );
}

export default ResourceGuidePage;
