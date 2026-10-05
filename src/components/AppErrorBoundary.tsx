import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props { children: React.ReactNode }
interface State { error: Error | null }

/** Prevents a production render exception from becoming an unexplained black screen. */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[GoPAL] render failure', error, info.componentStack);
  }
  private retry = () => this.setState({ error: null });
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-7">
        <Text className="text-center text-[11px] font-bold uppercase tracking-[2px] text-emerald-400">Emerald Valley paused</Text>
        <Text className="mt-3 text-center text-2xl font-black text-white">The world could not finish opening.</Text>
        <Text className="mt-3 text-center text-sm leading-5 text-slate-400">GoPAL caught a startup rendering error instead of leaving you with a black screen.</Text>
        <View className="mt-5 w-full rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
          <Text selectable className="text-xs leading-5 text-red-200">{this.state.error.message || 'Unknown rendering error'}</Text>
        </View>
        <Pressable onPress={this.retry} className="mt-5 rounded-full bg-emerald-400/15 px-6 py-3">
          <Text className="text-sm font-bold text-emerald-200">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
