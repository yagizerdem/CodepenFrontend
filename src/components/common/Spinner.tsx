import styled, { keyframes } from "styled-components";

const rotation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

type LoaderProps = {
  color?: string;
  size?: number;
};

const Loader = styled.span<LoaderProps>`
  width: ${({ size }) => (size ? `${size}px` : "48px")};
  height: ${({ size }) => (size ? `${size}px` : "48px")};
  border: 5px solid ${({ color }) => color || "#fff"};
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: ${rotation} 1s linear infinite;
`;

export function Spinner({ color = "#fff", size = 48 }: LoaderProps) {
  return <Loader color={color} size={size} />;
}
