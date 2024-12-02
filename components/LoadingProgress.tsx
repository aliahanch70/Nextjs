// 'use client';
//
// import { Progress } from "@chakra-ui/react";
// import { useState, useEffect } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
//
// export function LoadingProgress() {
//   const [progress, setProgress] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//
//   useEffect(() => {
//     // Reset progress when navigation starts
//     setIsLoading(true);
//     setProgress(0);
//
//     // Simulate progress
//     const timer = setInterval(() => {
//       setProgress((oldProgress) => {
//         if (oldProgress >= 100) {
//           clearInterval(timer);
//           setIsLoading(false);
//           return 100;
//         }
//         return Math.min(oldProgress + 10, 100);
//       });
//     }, 100);
//
//     // Cleanup
//     return () => {
//       clearInterval(timer);
//     };
//   }, [pathname, searchParams]); // Reset when route changes
//
//   if (!isLoading) return null;
//
//   return (
//     <div className="fixed top-0 left-0 right-0 z-50">
//       <Progress value={progress} size="xs" />
//     </div>
//   );
// }