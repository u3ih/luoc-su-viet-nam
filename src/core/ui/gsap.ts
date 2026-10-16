"use client";

// Đăng ký plugin GSAP một lần cho toàn app. Import từ đây thay vì "gsap" trực tiếp.
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: "power3.out", duration: 1 });

export { gsap, ScrollTrigger, SplitText, useGSAP };
