import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("CivicLens runtime error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: "#F7FAFC", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={{ width: "100%", maxWidth: 520, borderRadius: 28, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE4EC", padding: 24 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#FDECEC", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 22 }}>!</Text>
          </View>
          <Text style={{ marginTop: 18, fontSize: 24, fontWeight: "800", color: "#11243B" }}>CivicLens hit a runtime error</Text>
          <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 21, color: "#5B7084" }}>
            The app loaded, but one screen failed while starting. Your cases are not deleted.
          </Text>
          <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: "#F5F7FA", padding: 12 }}>
            <Text selectable style={{ fontSize: 12, lineHeight: 18, color: "#7A3030" }}>
              {this.state.error?.message || "Unknown runtime error"}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              this.setState({ error: null });
              if (typeof window !== "undefined") window.location.reload();
            }}
            style={{ marginTop: 18, borderRadius: 16, backgroundColor: "#1F5EFF", padding: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Reload CivicLens</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
